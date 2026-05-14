import type { Route } from "./+types/analyze-watchlist";

import { GoogleGenAI } from "@google/genai";
import * as Sentry from "@sentry/react-router";
import { DateTime } from "luxon";
import { data } from "react-router";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import adminClient from "~/core/lib/supa-admin-client.server";
import { insertTickerAnalyses } from "~/features/news/mutations";
import {
  getEconomyNewsByCategory,
  getUniqueWatchlistTickers,
} from "~/features/news/queries";

const ai = new GoogleGenAI({});

// AI 응답 스키마 정의
const analysisSchema = z.object({
  analyses: z.array(
    z.object({
      ticker: z
        .string()
        .describe("The ticker symbol (e.g., AAPL, TSLA, 005930)"),
      status: z
        .string()
        .describe(
          "A concise 1-2 word Korean phrase explaining the status (e.g., '변동성 주의', '금리 수혜주', '실적 기대')",
        ),
      summary: z
        .string()
        .describe(
          "A professional 1-2 sentence Korean summary explaining how the news specifically affects this stock or its market segment",
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

    // 2. 관심 종목에 등록된 모든 Unique Ticker를 가져옵니다. (AI 뉴스 구독이 켜져 있는 종목만)
    const watchlists = await getUniqueWatchlistTickers(adminClient, true);
    // 미국/한국 시장 분리
    const usTickers = watchlists
      .filter((w: any) => w.tickers?.market === "US")
      .map((w: any) => w.ticker);

    const krTickers = watchlists
      .filter((w: any) => w.tickers?.market === "KR")
      .map((w: any) => w.ticker);
    // ticker별 현재 주가 맵 생성 (last_price가 있는 종목만)
    const priceMap: Record<string, number> = {};
    for (const w of watchlists as any[]) {
      if (w.ticker && w.tickers?.last_price != null) {
        priceMap[w.ticker] = w.tickers.last_price;
      }
    }

    const processedAnalyses: any[] = [];

    // 3. US/KR 뉴스를 병렬로 미리 fetch
    const [usNews, krNews] = await Promise.all([
      getEconomyNewsByCategory(adminClient, "US_STOCK"),
      getEconomyNewsByCategory(adminClient, "KR_STOCK"),
    ]);

    // 공통 분석 처리 함수 (시장별로 AI를 각각 호출)
    const processMarketAnalysis = async (
      tickers: string[],
      newsCategory: string,
      market: "US" | "KR",
      topNews: typeof usNews,
      extraNews?: typeof usNews, // KR 시장 분석 시 미국 뉴스를 추가 컨텍스트로 전달
    ) => {
      if (tickers.length === 0) return;

      if (topNews.length === 0) {
        console.log(`[${newsCategory}] 분석할 뉴스 데이터가 없습니다.`);
        return;
      }

      // 주요 뉴스 컨텍스트 (해당 시장)
      const primaryNewsContext = topNews
        .map((n: any) => `Headline: ${n.headline}\nSummary: ${n.summary}`)
        .join("\n\n---\n\n");

      // 추가 뉴스 컨텍스트 (KR 분석 시 미국 뉴스)
      const extraNewsContext =
        extraNews && extraNews.length > 0
          ? extraNews
              .map((n: any) => `Headline: ${n.headline}\nSummary: ${n.summary}`)
              .join("\n\n---\n\n")
          : null;

      const primaryLabel =
        market === "US"
          ? "Latest Top 5 US Stock News"
          : "Latest Top 5 Korean Stock News";

      console.log(
        `[${newsCategory}] 총 ${tickers.length}개 종목에 대한 AI 분석 시작...`,
      );

      const CHUNK_SIZE = 20;

      for (let i = 0; i < tickers.length; i += CHUNK_SIZE) {
        const chunk = tickers.slice(i, i + CHUNK_SIZE);
        const currency = market === "US" ? "USD" : "KRW";
        const priceContext = chunk
          .map((ticker) =>
            priceMap[ticker] != null
              ? `${ticker}: ${priceMap[ticker].toLocaleString()} ${currency}`
              : `${ticker}: N/A`,
          )
          .join("\n");
        const tickerContext = chunk.join(", ");

        console.log(
          `[${newsCategory}] ${i + 1} ~ ${i + chunk.length} / ${tickers.length}개 종목 분석 요청 중...`,
        );

        try {
          // 4. AI 호출 및 분석 요청
          // KR 시장은 미국 뉴스 섹션을 추가로 포함
          const newsSection = extraNewsContext
            ? `[Latest Top 5 US Stock News (Global Context)]\n${extraNewsContext}\n\n[${primaryLabel}]\n${primaryNewsContext}`
            : `[${primaryLabel}]\n${primaryNewsContext}`;

          const aiResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `[Today's Date (KST)]\n${todayStr}\n\n[Current Stock Prices as of ${todayStr}]\n${priceContext}\n\n${newsSection}\n\n[Analysis Target Stocks]\n${tickerContext}`,
            config: {
              responseMimeType: "application/json",
              responseJsonSchema: zodToJsonSchema(analysisSchema),
              systemInstruction: `
                # Identity
                You are a senior financial analyst who sharply analyzes the short-term impact and momentum of individual stocks based on the latest economic news.

                # Critical Date & Price Context
                - Today's date is **${todayStr} (KST)**. All analysis MUST be based strictly on this date. Do NOT reference or assume any other date.
                - The [Current Stock Prices] section contains the latest recorded prices for each stock. Use these prices as the current market price for your analysis. Do NOT reference or assume any other price.

                # Instructions
                - Analyze **EVERY stock** in the [Analysis Target Stocks] list by combining the provided news sections with your latest financial knowledge of each individual stock.
                - When writing the summary, **you MUST ensure a harmonized 1:1 ratio between "the direct/indirect impact from the provided news" and "your practical advice on the stock's unique momentum, resistance/support levels, and external environment for the day"**. Do not lean too heavily on just the news or just the technicals.
                - 'status' must be a clear 1-2 word phrase in **KOREAN** that best represents the current status of the stock. (e.g., "단기 변동성 높음", "조정 구간 진입", "모멘텀 회복", "섹터 수혜", "관망 필요")
                - 'summary' must be 2-3 sentences in **KOREAN** explaining the specific impact of the news on the stock, along with the short-term stance (expectations, precautions, etc.) investors should take today. Write the summary as a single continuous paragraph without any line breaks.
                - Maintain a professional and objective analyst tone.
              `,
              temperature: 1,
              topP: 0.8,
            },
          });

          const text = aiResponse.text;
          if (!text) {
            console.error(
              `[${newsCategory}] Chunk ${i}번대 AI 응답이 비어있습니다. 다음 청크로 넘어갑니다.`,
            );
            continue;
          }

          // JSON 파싱 및 데이터 정제
          const parsedResult = analysisSchema.parse(JSON.parse(text));

          // 5. ticker_analysis 테이블에 일괄 Insert (Mutation 파일 활용)
          const recordsToInsert = parsedResult.analyses.map((item) => ({
            ticker: item.ticker,
            status: item.status,
            summary: item.summary.replace(/\\n/g, " ").replace(/\n/g, " "),
          }));

          try {
            await insertTickerAnalyses(adminClient, recordsToInsert);
          } catch (insertError: any) {
            console.error(
              `DB Insert 에러 (${newsCategory} chunk): ${insertError.message}`,
            );
            Sentry.captureException(
              new Error(`Chunk Insert Error: ${insertError.message}`),
            );
            continue; // 에러가 나도 다음 묶음을 계속 진행
          }

          processedAnalyses.push(...recordsToInsert);

          // API Rate Limit 방지를 위해 1초 대기
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (chunkError) {
          console.error(
            `Chunk 처리 중 에러 발생 (${newsCategory}):`,
            chunkError,
          );
          Sentry.captureException(
            chunkError instanceof Error
              ? chunkError
              : new Error(String(chunkError)),
          );
          // 특정 묶음에서 에러가 나도 크론 잡 전체가 죽지 않도록 continue 처리
          continue;
        }
      }
    };

    // 미국 주식 분석 실행
    await processMarketAnalysis(usTickers, "US_STOCK", "US", usNews);

    // 한국 주식 분석 실행 (국내 뉴스 + 미국 뉴스를 글로벌 컨텍스트로 추가)
    await processMarketAnalysis(krTickers, "KR_STOCK", "KR", krNews, usNews);

    return Response.json({
      success: true,
      message: `${processedAnalyses.length}개 종목 분석 완료`,
      analyzedData: processedAnalyses,
    });
  } catch (error) {
    console.error("Error analyzing watchlists:", error);

    // 에러 발생 시 Sentry로 트래킹
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
