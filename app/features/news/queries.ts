import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import { DateTime } from "luxon";

/**
 * Fetch the latest economy indices for each ticker.
 */
export async function getLatestEconomyIndices(
  client: SupabaseClient<Database>,
) {
  const { data, error } = await client
    .from("economy_indices")
    .select("ticker, current_price, change_percent, base_date");

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Search tickers by query string.
 */
export async function searchTickers(
  client: SupabaseClient<Database>,
  query: string,
) {
  const trimmedQuery = query.trim();
  const sanitizedQuery = trimmedQuery.replace(/\s/g, "");
  if (!sanitizedQuery) return [];

  const lowerQuery = trimmedQuery.toLowerCase();
  const lowerSanitized = sanitizedQuery.toLowerCase();

  // 1. DB에서 최대한 관련성 높은 후보군을 가져옵니다.
  const { data, error } = await client
    .from("tickers")
    .select("*")
    .or(
      `ticker.ilike.${sanitizedQuery}%,ticker.eq.${sanitizedQuery.toUpperCase()},name_en.ilike.%${sanitizedQuery}%,name_ko.ilike.%${sanitizedQuery}%`,
    )
    .order("market", { ascending: false }) // US(U)가 KR(K)보다 먼저 오도록 하여 미국 주식 우선 확보
    .order("ticker")
    .limit(300); // 충분한 후보군 확보

  if (error) {
    throw error;
  }

  if (!data) return [];

  // 2. 검색 결과에 대해 연관성 점수를 매겨 정렬합니다.
  const scoredData = (data as any[]).map((item) => {
    let score = 0;
    const ticker = (item.ticker || "").trim().toLowerCase();
    const nameEn = (item.name_en || "").trim().toLowerCase();
    const nameKo = (item.name_ko || "").trim().toLowerCase();
    const market = item.market || "KR";

    // [핵심 1] 미국 주식 우선순위 가중치 (1순위)
    if (market === "US") {
      score += 10000;
    }

    // [핵심 2] 티커 일치 여부 (2순위)
    if (ticker === lowerSanitized) {
      score += 5000; // 티커가 정확히 일치하면 해당 시장 내에서 최상단
    } else if (ticker.startsWith(lowerSanitized)) {
      score += 2000;
    } else if (ticker.includes(lowerSanitized)) {
      score += 500;
    }

    // [핵심 3] 이름 일치 여부
    if (nameEn === lowerQuery || nameKo === lowerQuery) {
      score += 1000;
    } else if (nameEn.startsWith(lowerQuery) || nameKo.startsWith(lowerQuery)) {
      score += 400;
    }

    return { ...item, score };
  });

  // 점수 높은 순 -> 티커 짧은 순 -> 티커 알파벳 순
  return scoredData
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aTicker = (a.ticker || "").trim();
      const bTicker = (b.ticker || "").trim();
      if (aTicker.length !== bTicker.length)
        return aTicker.length - bTicker.length;
      return aTicker.localeCompare(bTicker);
    })
    .slice(0, 20);
}

/**
 * Fetch the user's watchlist with ticker details.
 */
export async function getUserWatchlist(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await client
    .from("watchlists")
    .select(
      `
      watchlist_id,
      ticker,
      quantity,
      avg_price,
      total_asset,
      is_ai_news_subscribed,
      tickers (
        name_en,
        name_ko,
        market,
        exchange,
        last_price,
        updated_at
      )
    `,
    )
    .eq("profile_id", userId)
    .order("watchlist_id", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Fetch all unique tickers that are currently in any user's watchlist.
 */
export async function getUniqueWatchlistTickers(
  client: SupabaseClient<Database>,
  aiSubscribedOnly: boolean = false,
) {
  let query = client.from("tickers").select(`
      ticker,
      market,
      exchange,
      last_price,
      name_ko,
      watchlists!inner(ticker)
    `);

  if (aiSubscribedOnly) {
    query = query.eq("watchlists.is_ai_news_subscribed", true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map((item: any) => ({
    ticker: item.ticker,
    tickers: {
      market: item.market,
      exchange: item.exchange,
      last_price: item.last_price,
      name_ko: item.name_ko,
    },
  }));
}

/**
 * Fetch all watchlists grouped by profile_id, filtered by market ("US" | "KR").
 */
export async function getWatchlistsGroupedByProfile(
  client: SupabaseClient<Database>,
  market: "US" | "KR" = "US",
) {
  const { data, error } = await client
    .from("watchlists")
    .select("profile_id, ticker, tickers!inner(market)")
    .eq("tickers.market", market)
    .eq("is_ai_news_subscribed", true);

  if (error) {
    throw error;
  }

  const grouped = data.reduce((acc: Record<string, string[]>, item) => {
    if (!acc[item.profile_id]) {
      acc[item.profile_id] = [];
    }
    acc[item.profile_id].push(item.ticker);
    return acc;
  }, {});

  return Object.entries(grouped).map(([profile_id, tickers]) => ({
    profile_id,
    tickers,
  }));
}

/**
 * Fetch a specific provider's token.
 */
export async function getProviderToken(
  client: SupabaseClient<Database>,
  provider: string,
) {
  const { data, error } = await client
    .from("tokens")
    .select("*")
    .eq("provider", provider)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Fetch a ticker's market and exchange.
 */
export async function getTickerMarketAndExchange(
  client: SupabaseClient<Database>,
  ticker: string,
) {
  const { data, error } = await client
    .from("tickers")
    .select("market, exchange")
    .eq("ticker", ticker)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Fetch the top 5 economy news for a specific category using news_key prefix.
 */
export async function getEconomyNewsByCategory(
  client: SupabaseClient<Database>,
  category: string,
) {
  const { data, error } = await client
    .from("economy_news")
    .select("economy_news_id, headline, summary, url, news_key, updated_at")
    .ilike("news_key", `${category}_%`)
    .order("news_key", { ascending: true })
    .limit(10);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Fetch the latest ticker analyses for a list of tickers.
 */
export async function getLatestTickerAnalyses(
  client: SupabaseClient<Database>,
  tickers: string[],
) {
  if (!tickers || tickers.length === 0) return {};

  // KST 기준 오늘 00:00:00을 UTC ISO로 변환
  const todayKSTStart = DateTime.now()
    .setZone("Asia/Seoul")
    .startOf("day")
    .toUTC()
    .toISO()!;

  const { data, error } = await client
    .from("ticker_analysis")
    .select("ticker, status, summary")
    .in("ticker", tickers)
    .gte("updated_at", todayKSTStart);
  if (error) {
    throw error;
  }

  return (data || []).reduce((acc: Record<string, any>, item) => {
    acc[item.ticker] = item;
    return acc;
  }, {});
}

/**
 * Fetch the latest stock expert opinion for a specific user.
 */
export async function getLatestStockExpertOpinion(
  client: SupabaseClient<Database>,
  userId: string,
  market: "US" | "KR" = "US",
) {
  // KST 기준 오늘 00:00:00을 UTC ISO로 변환
  const todayKSTStart = DateTime.now()
    .setZone("Asia/Seoul")
    .startOf("day")
    .toUTC()
    .toISO()!;

  const { data, error } = await client
    .from("stock_expert_opinions")
    .select("summary, strategy_tags")
    .eq("profile_id", userId)
    .eq("market", market)
    .gte("updated_at", todayKSTStart)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Fetch all market indices.
 */
export async function getMarketIndices(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("market_indices")
    .select("symbol, name, price, change_percent, updated_at")
    .order("market_indices_id", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Fetch portfolio news for a user's watchlist tickers.
 */
export async function getUserPortfolioNews(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const { data: watchlistData, error: watchlistError } = await client
    .from("watchlists")
    .select("ticker")
    .eq("profile_id", userId);

  if (watchlistError) throw watchlistError;

  const tickers = (watchlistData || []).map((w) => w.ticker);
  if (tickers.length === 0) return [];

  // 24시간 이내의 뉴스만 필터링 (provider_publish_time은 초 단위 unix timestamp)
  const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  const { data: newsData, error: newsError } = await client
    .from("portfolio_news")
    .select(
      `
      portfolio_news_id,
      ticker,
      uuid,
      title,
      publisher,
      url,
      provider_publish_time,
      tickers (
        market,
        name_ko,
        name_en
      )
    `,
    )
    .in("ticker", tickers)
    .gte("provider_publish_time", oneDayAgo)
    .order("provider_publish_time", { ascending: false })
    .limit(Math.max(30, tickers.length * 3));

  if (newsError) throw newsError;

  return newsData || [];
}
