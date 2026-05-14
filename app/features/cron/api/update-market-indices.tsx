import type { Route } from "./+types/update-market-indices";

import { data } from "react-router";

import { getMarketData } from "~/core/lib/services.server";
import adminClient from "~/core/lib/supa-admin-client.server";
import { upsertMarketIndices } from "~/features/news/mutations";

export const action = async ({ request }: Route.ActionArgs) => {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    const marketData = await getMarketData();

    if (marketData && marketData.length > 0) {
      await upsertMarketIndices(
        adminClient,
        marketData.map((d) => ({
          symbol: d.symbol,
          name: d.name,
          price: d.price,
          change_percent: d.changePercent,
        })),
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating market indices:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
};
