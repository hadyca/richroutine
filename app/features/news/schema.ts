import { sql } from "drizzle-orm";
import {
  doublePrecision,
  pgPolicy,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

/**
 * Economy Indices Table
 *
 * Stores volatility index data (VIX, VKOSPI) fetched daily via cron job.
 * Stores a history of indicator values for trend analysis.
 *
 * RLS Policy: All users (authenticated and anonymous) can read.
 * Only admin (via adminClient) can write.
 */
export const economyIndices = pgTable(
  "economy_indices",
  {
    ...makeIdentityColumn("economy_indices_id"),
    symbol: text().notNull(),
    current_price: doublePrecision().notNull(),
    change_percent: doublePrecision(),
    base_date: timestamp(),
    ...timestamps,
  },
  (table) => [
    // RLS Policy: All users can view economy indices
    pgPolicy("select-economy-indices-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);

/**
 * Economy Analysis Table
 *
 * Stores AI-generated analysis of economy indices.
 * One record per day with analysis of VIX, VKOSPI, KB, and overall market outlook.
 */
export const economyAnalysis = pgTable(
  "economy_analysis",
  {
    ...makeIdentityColumn("economy_analysis_id"),
    vix_summary: text().notNull(),
    vkospi_summary: text().notNull(),
    kb_summary: text().notNull(),
    overall_summary: text().notNull(),
    ...timestamps,
  },
  (table) => [
    // RLS Policy: Only authenticated users can view economy analysis
    pgPolicy("select-economy-analysis-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);
