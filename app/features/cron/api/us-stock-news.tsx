import type { Route } from "./+types/us-stock-news";

import * as Sentry from "@sentry/react-router";
import { GoogleGenAI } from "@google/genai";
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
            "A professional and catchy KOREAN translation of the original headline",
          ),
        summary: z
          .string()
          .describe(
            "A concise, professional 2-3 sentence Korean summary of the original article",
          ),
        url: z.string().describe("Original URL of the news article"),
      }),
    )
    .length(5)
    .describe(
      "Exactly 5 independent and most important news articles selected from the list",
    ),
});

export const action = async ({ request }: Route.ActionArgs) => {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

    if (!FINNHUB_API_KEY) {
      throw new Error("Missing FINNHUB_API_KEY in environment variables.");
    }

    // Call the Finnhub API for general market news
    const response = await axios.get("https://finnhub.io/api/v1/news", {
      params: {
        category: "general",
        token: FINNHUB_API_KEY,
      },
    });

    let newsData = response.data;

    // Finnhub의 최신 뉴스 중 '최근 24시간 이내' 기사만 필터링합니다.
    if (Array.isArray(newsData)) {
      const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60; // 24시간 전 (초 단위)
      newsData = newsData.filter((n: any) => n.datetime >= oneDayAgo);

      // 당일 발행 뉴스가 100개가 넘을 경우 최신순(앞부분) 100개로 자릅니다.
      newsData = newsData.slice(0, 100);
    }

    // AI에게 전달할 컨텍스트 텍스트 생성 (API 원본 값들 포함)
    const newsContext = newsData
      .map(
        (n: any) =>
          `Headline: ${n.headline}\nSummary: ${n.summary}\nURL: ${n.url}`,
      )
      .join("\n\n---\n\n");

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following ${newsData.length} latest US market news articles from the past 24 hours:\n\n${newsContext}`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(topNewsSchema),
        systemInstruction: `
          # Identity
          You are an expert data curator who filters out noise and redundant information, selecting only the most critical news articles.

          # Instructions
          - Carefully analyze the provided ${newsData.length} recent US stock/economy news articles.
          - Select EXACTLY 5 key news articles that have the most significant impact on the market. Ensure there is absolutely NO overlapping or redundant content among the 5 chosen articles.
          - For the 'url', return the EXACT original value provided. Do NOT translate or modify it.
          - For the 'headline', completely translate the original headline into a professional and clear KOREAN headline.
          - For the 'summary', DO NOT return the original text. Instead, write a concise, professional 2-3 sentence summary in KOREAN that clearly explains the core events and their market impact based on the original content.
          - The array of 5 returned news articles MUST be sorted in descending order of priority, from the most impactful and important (1st) to the least among the top 5 (5th).
          `,
        temperature: 0.3, // 요약/번역의 자연스러움을 위해 온도를 조금 올림
        topP: 0.8, // 적절한 창의성과 정확성의 밸런스
      },
    });

    const text = aiResponse.text;
    if (!text) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    const aiSummaryResult = topNewsSchema.parse(JSON.parse(text));

    // Data preparation for insertion

    const newsToInsert = aiSummaryResult.top_news
      .slice(0, 5)
      .map((item, index) => ({
        news_key: `US_STOCK_${index + 1}`, // US_STOCK_1, US_STOCK_2... 순서대로 생성
        headline: item.headline,
        summary: item.summary,
        url: item.url,
      }));
    // Output or process the fetched data here (e.g., store in the database).
    try {
      await upsertEconomyNews(adminClient, newsToInsert);
      console.log(`Successfully generated and inserted Top 5 news summary.`);
    } catch (insertError: any) {
      throw new Error(`DB Insert 에러: ${insertError.message}`);
    }

    return Response.json({
      success: true,
      analyzedNews: aiSummaryResult.top_news,
    });
  } catch (error) {
    console.error("Error fetching or analyzing general news:", error);
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
