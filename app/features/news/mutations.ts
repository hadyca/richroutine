import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

/**
 * Add a ticker to the user's watchlist.
 *
 * @param client - Authenticated Supabase client instance
 * @param userId - The user's profile ID
 * @param ticker - The ticker symbol to add
 * @returns The created watchlist record
 */
export async function addToWatchlist(
  client: SupabaseClient<Database>,
  userId: string,
  ticker: string,
  quantity: number = 0,
  avgPrice: number = 0,
) {
  const { data, error } = await client
    .from("watchlists")
    .upsert(
      {
        profile_id: userId,
        ticker: ticker,
        quantity: quantity,
        avg_price: avgPrice,
        total_asset: quantity * avgPrice,
      },
      { onConflict: "profile_id,ticker" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update quantity and avg_price for an existing watchlist entry.
 */
export async function updateWatchlistItem(
  client: SupabaseClient<Database>,
  userId: string,
  ticker: string,
  quantity: number,
  avgPrice: number,
) {
  const { error } = await client
    .from("watchlists")
    .update({
      quantity,
      avg_price: avgPrice,
      total_asset: quantity * avgPrice,
    })
    .eq("profile_id", userId)
    .eq("ticker", ticker);

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function toggleAiNews(
  client: SupabaseClient<Database>,
  userId: string,
  ticker: string,
  checked: boolean,
) {
  const { error } = await client
    .from("watchlists")
    .update({ is_ai_news_subscribed: checked })
    .eq("profile_id", userId)
    .eq("ticker", ticker);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Remove a ticker from the user's watchlist.
 *
 * @param client - Authenticated Supabase client instance
 * @param userId - The user's profile ID
 * @param ticker - The ticker symbol to remove
 * @returns Success status
 */
export async function removeFromWatchlist(
  client: SupabaseClient<Database>,
  userId: string,
  ticker: string,
) {
  const { error } = await client
    .from("watchlists")
    .delete()
    .eq("profile_id", userId)
    .eq("ticker", ticker);

  if (error) {
    throw error;
  }

  return { success: true };
}
/**
 * Update the last price and update timestamp for a ticker.
 *
 * @param client - Authenticated Supabase client instance
 * @param ticker - The ticker symbol to update
 * @param price - The new price
 * @returns Success status
 */
export async function updateTickerPrice(
  client: SupabaseClient<Database>,
  ticker: string,
  price: number,
) {
  const { error } = await client
    .from("tickers")
    .update({
      last_price: price,
      price_updated_at: new Date().toISOString(),
    })
    .eq("ticker", ticker);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Upsert a provider's token.
 *
 * @param client - Authenticated Supabase client instance (usually adminClient)
 * @param provider - The provider name (e.g., 'KIS')
 * @param accessToken - The new access token
 * @param expiresAt - The expiration date
 * @returns The upserted record
 */
export async function upsertProviderToken(
  client: SupabaseClient<Database>,
  provider: string,
  accessToken: string,
  expiresAt: Date,
) {
  const { data, error } = await client
    .from("tokens")
    .upsert(
      {
        provider,
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "provider" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Insert economy indices.
 *
 * @param client - Authenticated Supabase client instance (usually adminClient)
 * @param indices - The economy indices data to insert
 * @returns Success status
 */
export async function upsertEconomyIndices(
  client: SupabaseClient<Database>,
  indices: any[],
) {
  const { error } = await client
    .from("economy_indices")
    .upsert(indices, { onConflict: "ticker, base_date" });

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Insert economy analysis.
 *
 * @param client - Authenticated Supabase client instance (usually adminClient)
 * @param analysis - The economy analysis data to insert
 * @returns Success status
 */

/**
 * Insert economy news articles.
 *
 * @param client - Authenticated Supabase client instance (usually adminClient)
 * @param newsItems - The economy news data to insert
 * @returns Success status
 */
export async function upsertEconomyNews(
  client: SupabaseClient<Database>,
  newsItems: {
    news_key: string;
    headline: string;
    summary: string;
    url: string;
  }[],
) {
  const { error } = await client
    .from("economy_news")
    .upsert(newsItems, { onConflict: "news_key" });

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Insert ticker analyses.
 *
 * @param client - Authenticated Supabase client instance
 * @param analyses - Array of ticker analysis data items
 * @returns Success status
 */
export async function insertTickerAnalyses(
  client: SupabaseClient<Database>,
  analyses: {
    ticker: string;
    status: string;
    summary: string;
  }[],
) {
  const { error } = await client
    .from("ticker_analysis")
    .upsert(analyses, { onConflict: "ticker" });

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Insert US stock expert opinion.
 * @param client - Authenticated Supabase client instance
 * @param opinion - The expert opinion data
 * @returns Success status
 */
/**
 * Upsert stock expert opinion.
 * @param client - Authenticated Supabase client instance
 * @param opinion - The expert opinion data
 * @returns Success status
 */
export async function insertStockExpertOpinion(
  client: SupabaseClient<Database>,
  opinion: {
    profile_id: string;
    summary: string;
    strategy_tags: string[];
    market: "US" | "KR";
  },
) {
  const { error } = await client
    .from("stock_expert_opinions")
    .upsert(opinion, { onConflict: "profile_id, market" });

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Upsert market indices.
 *
 * @param client - Authenticated Supabase client instance (usually adminClient)
 * @param indices - The market indices data to insert
 * @returns Success status
 */
export async function upsertMarketIndices(
  client: SupabaseClient<Database>,
  indices: {
    symbol: string;
    name: string;
    price: number;
    change_percent: number;
  }[],
) {
  const { error } = await client
    .from("market_indices")
    .upsert(indices, { onConflict: "symbol" });

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Upsert portfolio news articles.
 *
 * @param client - Authenticated Supabase client instance (usually adminClient)
 * @param newsItems - The portfolio news data to insert
 * @returns Success status
 */

export async function upsertPortfolioNews(
  client: SupabaseClient<Database>,
  newsItems: {
    ticker: string;
    uuid: string;
    title: string;
    publisher?: string;
    url: string;
    provider_publish_time?: number;
  }[],
) {
  const { error } = await client
    .from("portfolio_news")
    .upsert(newsItems, { onConflict: "ticker, uuid" });

  if (error) {
    throw error;
  }

  return { success: true };
}
