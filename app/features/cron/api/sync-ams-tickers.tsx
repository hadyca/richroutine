import type { Route } from "./+types/sync-ams-tickers";

import { data } from "react-router";

import { syncMarketTickers } from "~/core/lib/tickers-service.server";

export const action = async ({ request }: Route.ActionArgs) => {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    const count = await syncMarketTickers("ams");
    return Response.json({
      success: true,
      market: "AMEX",
      synced_count: count,
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
