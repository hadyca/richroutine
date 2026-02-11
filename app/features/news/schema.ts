import { sql } from "drizzle-orm";
import {
  doublePrecision,
  pgPolicy,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

/**
 * Economy Indices Table
 *
 * Stores volatility index data (VIX, VKOSPI) fetched daily via cron job.
 * Each symbol has only one record that gets updated daily.
 *
 * RLS Policy: All users (authenticated and anonymous) can read.
 * Only admin (via adminClient) can write.
 */
export const economyIndices = pgTable(
  "economy_indices",
  {
    ...makeIdentityColumn("economy_indices_id"),
    symbol: text().notNull().unique(),
    current_price: doublePrecision().notNull(),
    change_percent: doublePrecision(),

    // Index base date (e.g., '20260202' or '2026-02-11')
    base_date: timestamp(),

    ...timestamps,
  },
  (table) => [
    // RLS Policy: All users can view economy indices
    pgPolicy("select-economy-indices-policy", {
      for: "select",
      to: [authenticatedRole, anonRole],
      as: "permissive",
      using: sql`true`,
    }),
  ],
);

/**
 * Economy Analysis Table
 *
 * Stores AI-generated analysis of economy indices.
 * One record per day with analysis of VIX, VKOSPI, and overall market outlook.
 */
// export const economyAnalysis = pgTable("economy_analysis", {
//   ...makeIdentityColumn("economy_analysis_id"),

//   analysis_date: timestamp().notNull().unique(),

//   vix_summary: text().notNull(),

//   vkospi_summary: text().notNull(),

//   overall_summary: text().notNull(),

//   market_outlook: text({ enum: ["bullish", "neutral", "bearish"] }).notNull(),

//   ...timestamps,
// });
