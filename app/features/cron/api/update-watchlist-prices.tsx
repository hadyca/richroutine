import type { Route } from "./+types/update-watchlist-prices";

import { data } from "react-router";

import {
  fetchKRStockPrice,
  fetchUSStockPrice,
} from "~/core/lib/economy-service.server";
import adminClient from "~/core/lib/supa-admin-client.server";
import { updateTickerPrice } from "~/features/news/mutations";
import { getUniqueWatchlistTickers } from "~/features/news/queries";

/**
 * Watchlist Price Update Cron Job
 * 관심 종목 가격 업데이트 크론 잡
 *
 * This endpoint updates the last_price of tickers that are currently in any user's watchlist.
 * It uses a sequential approach with delays to respect KIS API rate limits (20 req/s).
 *
 * 이 엔드포인트는 유저의 관심 종목에 등록된 티커들의 최신 가격을 업데이트합니다.
 * KIS API의 초당 호출 제한(20회)을 준수하기 위해 순차적으로 처리하며 지연 시간을 둡니다.
 */
export const action = async ({ request }: Route.ActionArgs) => {
  // Verify request method and cron secret
  // 요청 메서드와 크론 시크릿 확인
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    // 1. Fetch unique tickers that exist in watchlists
    // watchlists 테이블에서 고유한 티커 목록과 해당 티커의 마켓 정보를 가져옵니다 (쿼리 함수 사용).
    const watchlistTickers = await getUniqueWatchlistTickers(adminClient);

    // 2. Remove duplicates and filter valid data
    // 중복된 티커를 제거하고 유효한 마켓 정보가 있는 것만 골라냅니다.
    const uniqueTickersMap = new Map();
    watchlistTickers.forEach((item: any) => {
      if (item.ticker && item.tickers && !uniqueTickersMap.has(item.ticker)) {
        uniqueTickersMap.set(item.ticker, item.tickers);
      }
    });

    const tickersToUpdate = Array.from(uniqueTickersMap.entries());
    const results = [];

    // 3. Update prices sequentially to avoid rate limiting
    // 순차적으로 가격을 조회하고 업데이트합니다.
    for (const [ticker, info] of tickersToUpdate) {
      try {
        let currentPrice: number | null = null;

        if (info.market === "US") {
          const priceData = await fetchUSStockPrice(ticker, info.exchange);
          currentPrice = priceData?.current_price;
        } else if (info.market === "KR") {
          const priceData = await fetchKRStockPrice(ticker);
          currentPrice = priceData?.current_price;
        }

        if (currentPrice !== null) {
          await updateTickerPrice(adminClient, ticker, currentPrice);

          results.push({ ticker, status: "success", price: currentPrice });
        }

        // 4. Throttling: Wait 100ms between calls (approx 10 req/s)
        // KIS API 제한을 피하기 위해 각 호출 사이 100ms의 대기 시간을 둡니다.
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error updating price for ${ticker}:`, err);
        results.push({
          ticker,
          status: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${results.filter((r) => r.status === "success").length} prices`,
      total_processed: results.length,
      details: results,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
