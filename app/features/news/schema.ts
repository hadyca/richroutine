import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  doublePrecision,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authUid, authenticatedRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

import { profiles } from "../users/schema";

export const tickers = pgTable(
  "tickers",
  {
    ...makeIdentityColumn("tickers_id"),
    ticker: text().notNull().unique(),
    name_en: text(),
    name_ko: text(),
    market: text().notNull(), // 'KR' | 'US'
    exchange: text().notNull(), // 'KOSPI', 'KOSDAQ', 'NASDAQ', 'NYSE', etc.
    logo_url: text(),
    last_price: doublePrecision(),
    price_updated_at: timestamp(),
    ...timestamps,
  },

  (table) => [
    pgPolicy("select-tickers-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
    pgPolicy("update-tickers-policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);

export const economyIndices = pgTable(
  "economy_indices",
  {
    ...makeIdentityColumn("economy_indices_id"),
    ticker: text().notNull(),
    current_price: doublePrecision("current_price").notNull(),
    change_percent: doublePrecision("change_percent"),
    base_date: timestamp("base_date").notNull(),
    ...timestamps,
  },
  (table) => [
    unique("economy_indices_ticker_date_unique").on(
      table.ticker,
      table.base_date,
    ),
    pgPolicy("select-economy-indices-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);

export const watchlists = pgTable(
  "watchlists",
  {
    ...makeIdentityColumn("watchlist_id"),
    profile_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    ticker: text()
      .notNull()
      .references(() => tickers.ticker, { onDelete: "cascade" }),
    quantity: doublePrecision().default(0),
    avg_price: doublePrecision().default(0),
    total_asset: doublePrecision().default(0),
    is_ai_news_subscribed: boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => [
    unique("watchlists_profile_id_ticker_unique").on(
      table.profile_id,
      table.ticker,
    ),

    pgPolicy("watchlist-select-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.profile_id}`,
    }),
    pgPolicy("watchlist-insert-policy", {
      for: "insert",
      to: authenticatedRole,
      as: "permissive",
      withCheck: sql`${authUid} = ${table.profile_id}`,
    }),
    pgPolicy("watchlist-delete-policy", {
      for: "delete",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.profile_id}`,
    }),
    pgPolicy("watchlist-update-policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.profile_id}`,
      withCheck: sql`${authUid} = ${table.profile_id}`,
    }),
  ],
);

export const tokens = pgTable("tokens", {
  ...makeIdentityColumn("tokens_id"),
  provider: text().notNull().unique(), // 'KIS', etc.
  access_token: text().notNull(),
  expires_at: timestamp().notNull(),
  ...timestamps,
});

export const economyNews = pgTable(
  "economy_news",
  {
    ...makeIdentityColumn("economy_news_id"),
    news_key: text("news_key").notNull().unique(),
    headline: text("headline").notNull(),
    summary: text("summary").notNull(),
    url: text("url").notNull(),
    ...timestamps,
  },
  (table) => [
    pgPolicy("select-economy-news-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);

export const tickerAnalysis = pgTable(
  "ticker_analysis",
  {
    ...makeIdentityColumn("ticker_analysis_id"),
    ticker: text()
      .notNull()
      .unique()
      .references(() => tickers.ticker, { onDelete: "cascade" }),
    summary: text().notNull(),
    status: text().notNull(),
    ...timestamps,
  },
  (table) => [
    pgPolicy("select-ticker-analysis-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);

export const stockExpertOpinions = pgTable(
  "stock_expert_opinions",
  {
    ...makeIdentityColumn("stock_expert_opinions_id"),
    profile_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    market: text(), // 'US' | 'KR'
    summary: text().notNull(),
    strategy_tags: text("strategy_tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ...timestamps,
  },
  (table) => [
    unique("stock_expert_opinions_profile_id_market_unique").on(
      table.profile_id,
      table.market,
    ),

    pgPolicy("select-stock-expert-opinions-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.profile_id}`,
    }),
  ],
);

export const marketIndices = pgTable(
  "market_indices",
  {
    ...makeIdentityColumn("market_indices_id"),
    symbol: text().notNull().unique(),
    name: text().notNull(),
    price: doublePrecision().notNull(),
    change_percent: doublePrecision().notNull(),
    ...timestamps,
  },
  (table) => [
    pgPolicy("select-market-indices-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);

export const portfolioNews = pgTable(
  "portfolio_news",
  {
    ...makeIdentityColumn("portfolio_news_id"),
    ticker: text()
      .notNull()
      .references(() => tickers.ticker, { onDelete: "cascade" }),
    uuid: text().notNull(),
    title: text().notNull(),
    publisher: text(),
    url: text().notNull(),
    provider_publish_time: bigint({ mode: "number" }),
    ...timestamps,
  },
  (table) => [
    unique("portfolio_news_ticker_uuid_unique").on(table.ticker, table.uuid),
    pgPolicy("select-portfolio-news-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);
