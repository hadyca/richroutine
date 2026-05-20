import type { Route } from "./+types/kr-stock-news";

import { GoogleGenAI } from "@google/genai";
import * as Sentry from "@sentry/react-router";
import axios from "axios";
import { data } from "react-router";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import adminClient from "~/core/lib/supa-admin-client.server";
import { upsertEconomyNews } from "~/features/news/mutations";

const ai = new GoogleGenAI({});

const topNewsSchema = z.object({
  top_news: z
    .array(
      z.object({
        headline: z
          .string()
          .describe(
            "A clear and professional KOREAN headline rewritten from the original",
          ),
        summary: z
          .string()
          .describe(
            "A concise, professional 2-3 sentence KOREAN summary including market impact, based on the original article",
          ),
        url: z
          .string()
          .describe(
            "Original URL of the news article (return as-is, do not modify)",
          ),
      }),
    )
    .length(5)
    .describe(
      "Exactly 5 independent and most impactful Korean stock/economy news articles",
    ),
});

// 네이버 API 응답의 HTML 태그 제거 (<b>, </b> 등)
function stripHtmlTags(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'");
}

export const action = async ({ request }: Route.ActionArgs) => {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
    const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      throw new Error(
        "Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET in environment variables.",
      );
    }

    const naverHeaders = {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    };
    const naverParams = { display: 50, sort: "date" };

    // 코스피 / 코스닥 / 증시 세 키워드로 병렬 호출 (각 50건씩)
    const [kospiRes, kosdaqRes, jungsiRes] = await Promise.all([
      axios.get("https://openapi.naver.com/v1/search/news.json", {
        headers: naverHeaders,
        params: { ...naverParams, query: "코스피" },
      }),
      axios.get("https://openapi.naver.com/v1/search/news.json", {
        headers: naverHeaders,
        params: { ...naverParams, query: "코스닥" },
      }),
      axios.get("https://openapi.naver.com/v1/search/news.json", {
        headers: naverHeaders,
        params: { ...naverParams, query: "증시" },
      }),
    ]);

    const combined: any[] = [
      ...(kospiRes.data?.items ?? []),
      ...(kosdaqRes.data?.items ?? []),
      ...(jungsiRes.data?.items ?? []),
    ];

    // 최근 12시간 이내 기사만 필터링 (pubDate: RFC 822 형식, KST 기준)
    const oneDayAgo = Date.now() - 12 * 60 * 60 * 1000;
    const recent = combined.filter((item: any) => {
      const published = new Date(item.pubDate).getTime();
      return published >= oneDayAgo;
    });

    // URL 기준 중복 제거 (originallink 우선)
    const seenUrls = new Set<string>();
    const deduped = recent.filter((item: any) => {
      const url = item.originallink || item.link;
      if (seenUrls.has(url)) return false;
      seenUrls.add(url);
      return true;
    });

    if (deduped.length === 0) {
      throw new Error("최근 12시간 이내 국내 증시 뉴스가 없습니다.");
    }

    // HTML 태그 제거 및 정제
    const newsData = deduped.map((item: any) => ({
      headline: stripHtmlTags(item.title ?? ""),
      summary: stripHtmlTags(item.description ?? ""),
      url: item.originallink || item.link,
    }));

    // AI에게 전달할 컨텍스트 생성
    const newsContext = newsData
      .map(
        (n) => `Headline: ${n.headline}\nSummary: ${n.summary}\nURL: ${n.url}`,
      )
      .join("\n\n---\n\n");

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following ${newsData.length} latest Korean stock/economy news articles:\n\n${newsContext}`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(topNewsSchema),
        systemInstruction: `
          # Identity
          You are an expert data curator who filters out noise and redundant information, selecting only the most critical Korean stock and economy news articles.

          # Instructions
          - Carefully analyze the provided ${newsData.length} recent Korean stock/economy news articles.
          - Select EXACTLY 5 key news articles that have the most significant impact on the Korean market. Ensure there is absolutely NO overlapping or redundant content among the 5 chosen articles.
          - For the 'url', return the EXACT original value provided. Do NOT translate or modify it.
          - For the 'headline', rewrite the original Korean headline into a clear and professional KOREAN headline.
          - For the 'summary', DO NOT return the original text. Instead, write a concise, professional 2-3 sentence summary in KOREAN that clearly explains the core events and their market impact.
          - The array of 5 returned news articles MUST be sorted in descending order of priority, from the most impactful and important (1st) to the least among the top 5 (5th).
          `,
        temperature: 0.3,
        topP: 0.8,
      },
    });

    const text = aiResponse.text;
    if (!text) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    const aiSummaryResult = topNewsSchema.parse(JSON.parse(text));

    // DB 삽입 준비
    const newsToInsert = aiSummaryResult.top_news
      .slice(0, 5)
      .map((item, index) => ({
        news_key: `KR_STOCK_${index + 1}`, // US_STOCK_1, US_STOCK_2... 순서대로 생성
        headline: item.headline,
        summary: item.summary,
        url: item.url,
      }));

    try {
      await upsertEconomyNews(adminClient, newsToInsert);
      console.log(`국내 증시 뉴스 Top 5 생성 및 저장 완료.`);
    } catch (insertError: any) {
      throw new Error(`DB Insert 에러: ${insertError.message}`);
    }

    return Response.json({
      success: true,
      analyzedNews: aiSummaryResult.top_news,
    });
  } catch (error) {
    console.error("Error fetching or analyzing KR stock news:", error);
    Sentry.captureException(error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
