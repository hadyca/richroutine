import type { Route } from "./+types/stock-opinion";

import { GoogleGenAI } from "@google/genai";
import * as Sentry from "@sentry/react-router";
import { DateTime } from "luxon";
import { data } from "react-router";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import adminClient from "~/core/lib/supa-admin-client.server";
import { insertStockExpertOpinion } from "~/features/news/mutations";
import {
  getEconomyNewsByCategory,
  getLatestTickerAnalyses,
  getWatchlistsGroupedByProfile,
} from "~/features/news/queries";

const ai = new GoogleGenAI({});

// AI 응답 스키마 정의 (배치 처리용)
const batchOpinionSchema = z.object({
  results: z.array(
    z.object({
      profile_id: z.string().describe("The profile ID of the user"),
      summary: z
        .string()
        .describe(
          "A professional 2-4 sentence Korean comprehensive market expert opinion based on the provided news and stock analyses.",
        ),
      strategy_tags: z
        .array(z.string())
        .describe(
          "3 short Korean strategy keywords/tags (e.g., '현금 비중 30%', '방어적 스탠스', '분할 매도')",
        ),
    }),
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
    // 오늘 날짜 (KST 기준)
    const todayStr = DateTime.now().setZone("Asia/Seoul").toISODate();

    // 뉴스 & 유저 목록 병렬 fetch
    const [usNews, krNews, usUsers, krUsers] = await Promise.all([
      getEconomyNewsByCategory(adminClient, "US_STOCK"),
      getEconomyNewsByCategory(adminClient, "KR_STOCK"),
      getWatchlistsGroupedByProfile(adminClient, "US"),
      getWatchlistsGroupedByProfile(adminClient, "KR"),
    ]);

    // 뉴스 컨텍스트 생성 헬퍼
    const buildNewsContext = (news: typeof usNews) =>
      news
        .map((n: any) => `- Headline: ${n.headline}\n  Summary: ${n.summary}`)
        .join("\n\n");

    const usNewsContext = buildNewsContext(usNews);
    const krNewsContext = buildNewsContext(krNews);

    // 시장별 종합 의견 생성 함수
    const processMarketOpinion = async (
      users: typeof usUsers,
      market: "US" | "KR",
      primaryNewsContext: string,
      extraNewsContext?: string, // KR 분석 시 US 뉴스를 글로벌 컨텍스트로 추가
    ) => {
      if (users.length === 0) return;

      const primaryNewsLabel =
        market === "US"
          ? "Latest Top 5 US Stock News"
          : "Latest Top 5 Korean Stock News";

      const newsSection = extraNewsContext
        ? `[Latest Top 5 US Stock News (Global Context)]\n${extraNewsContext}\n\n[${primaryNewsLabel}]\n${primaryNewsContext}`
        : `[${primaryNewsLabel}]\n${primaryNewsContext}`;

      const identityLine =
        market === "US"
          ? 'You are a world-class US stock market strategist providing a personalized "종합 투자 의견".'
          : 'You are a world-class Korean equity market strategist providing a personalized "종합 투자 의견". You understand both the global market environment and domestic Korean market dynamics.';

      console.log(
        `[${market}] 총 ${users.length}명의 유저에 대한 종합 의견 생성 시작 (Batch Mode)...`,
      );

      // 10명씩 배치(Batch)로 묶어서 처리하여 API 호출 횟수(RPD) 감소
      const CHUNK_SIZE = 10;
      for (let i = 0; i < users.length; i += CHUNK_SIZE) {
        const chunk = users.slice(i, i + CHUNK_SIZE);
        try {
          // 각 유저의 개별 분석 컨텍스트 병렬 준비
          const chunkContexts = await Promise.all(
            chunk.map(async (user) => {
              const tickerAnalyses = await getLatestTickerAnalyses(
                adminClient,
                user.tickers,
              );
              const analysisText =
                Object.values(tickerAnalyses)
                  .map((a: any) => `- ${a.ticker}: [${a.status}] ${a.summary}`)
                  .join("\n") || "No specific stock analysis available.";
              return `## User Profile ID: ${user.profile_id}\n${analysisText}`;
            }),
          );

          const combinedAnalysisContext = chunkContexts.join("\n\n---\n\n");

          let aiResponse: any = null;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              aiResponse = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `[Today's Date (KST)]\n${todayStr}\n\n${newsSection}\n\n[USER ANALYSES LIST]\n${combinedAnalysisContext}`,
                config: {
                  responseMimeType: "application/json",
                  responseJsonSchema: zodToJsonSchema(batchOpinionSchema),
                  systemInstruction: `
                    # Identity
                    ${identityLine}

                    # Critical Date Context
                    - Today's date is **${todayStr} (KST)**. All analysis and advice MUST be based strictly on this date.

                    # Task
                    - You are provided with a list of users, each with their own watchlist and specific stock analyses.
                    - For EACH user in the list, generate a personalized "종합 투자 의견".
                    - Ensure you return an array of results matching the requested JSON schema.

                    # Core Rule — DO NOT REPEAT
                    - NEVER copy or paraphrase sentences from the news.
                    - Provide NEW insight unique to each user's portfolio.

                    # What to Write (Per User)
                    - **'summary'** (2-4 sentences, Korean):
                      1. Interpretation of the market shift.
                      2. Personal connection to the user's specific holdings.
                      3. Actionable next-step recommendation.
                    - **'strategy_tags'**: 3 sharp Korean action tags.

                    # Tone
                    Premium, confident, and personalized.
                  `,
                  temperature: 1,
                  topP: 0.8,
                },
              });
              break;
            } catch (error: any) {
              if (error.status === 429 && retryCount < maxRetries - 1) {
                console.warn(
                  `[${market}] Batch Rate limit hit, retrying in 15s...`,
                );
                await new Promise((r) => setTimeout(r, 15000));
                retryCount++;
                continue;
              }
              throw error;
            }
          }

          const aiText = aiResponse?.text;
          if (!aiText) continue;

          const parsedResult = batchOpinionSchema.parse(JSON.parse(aiText));

          // 배치 결과를 하나씩 DB에 저장
          for (const result of parsedResult.results) {
            try {
              await insertStockExpertOpinion(adminClient, {
                profile_id: result.profile_id,
                market,
                summary: result.summary,
                strategy_tags: result.strategy_tags,
              });
            } catch (dbError) {
              console.error(
                `[${market}] DB Insert Error for ${result.profile_id}:`,
                dbError,
              );
            }
          }

          // 다음 배치를 위해 약간의 대기
          if (i + CHUNK_SIZE < users.length) {
            await new Promise((r) => setTimeout(r, 5000));
          }
        } catch (chunkError) {
          console.error(`[${market}] Chunk processing error:`, chunkError);
          Sentry.captureException(chunkError);
        }
      }
    };

    // US 종합 의견 생성 (US 뉴스만)
    await processMarketOpinion(usUsers, "US", usNewsContext);

    // KR 종합 의견 생성 (국내 뉴스 + 미국 뉴스를 글로벌 컨텍스트로 추가)
    await processMarketOpinion(krUsers, "KR", krNewsContext, usNewsContext);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error generating personalized opinions:", error);
    Sentry.captureException(error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
};
