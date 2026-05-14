import type { Route } from "./+types/get-market-fear";

import { data } from "react-router";

import { fetchVix } from "~/core/lib/economy-service.server";
import adminClient from "~/core/lib/supa-admin-client.server";
import { upsertEconomyIndices } from "~/features/news/mutations";

const syncMarketFear = async () => {
  const url = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CNN API 에러: ${response.status}`);
  }

  const result = await response.json();

  // 1. Get the full historical data
  const historicalData = result.fear_and_greed_historical?.data;

  if (
    !historicalData ||
    !Array.isArray(historicalData) ||
    historicalData.length === 0
  ) {
    throw new Error("No historical data found in CNN API response");
  }

  // 2. Deduplicate historical data by day first to ensure we have valid daily data
  const uniqueDailyDataMap = new Map();
  for (const item of historicalData) {
    const day = new Date(item.x).toISOString().split("T")[0];
    uniqueDailyDataMap.set(day, item); // Keeps the last item for each day
  }

  const uniqueDailyData = Array.from(uniqueDailyDataMap.values());

  // 마지막 2개 값이 동일할 경우(오늘 데이터가 아직 업데이트되지 않아 전날과 같은 경우) 마지막 값 제거
  if (uniqueDailyData.length >= 2) {
    const last = uniqueDailyData[uniqueDailyData.length - 1];
    const secondLast = uniqueDailyData[uniqueDailyData.length - 2];

    if (last.y === secondLast.y) {
      const lastDate = new Date(last.x).toISOString().split("T")[0];
      const todayDate = new Date().toISOString().split("T")[0];

      // 마지막 데이터가 오늘 날짜인데 값은 어제와 같다면, 아직 유효한 새 데이터가 아니므로 제거
      if (lastDate === todayDate) {
        uniqueDailyData.pop();
      }
    }
  }

  // We need at least 7 data points to calculate the percent change for 6 days
  const latestData = uniqueDailyData.slice(-7);

  // 3. Format data for database insertion
  const indicesToInsert = [];

  // Start from index 1 because we need the previous item (index i-1) to calculate percent change
  for (let i = 1; i < latestData.length; i++) {
    const prev = latestData[i - 1];
    const current = latestData[i];

    const prevPrice = prev.y;
    const currentPrice = current.y;

    let changePercent = 0;
    if (prevPrice > 0) {
      changePercent = ((currentPrice - prevPrice) / prevPrice) * 100;
    }

    indicesToInsert.push({
      ticker: "CNN_FG",
      current_price: currentPrice,
      change_percent: changePercent,
      base_date:
        new Date(current.x).toISOString().split("T")[0] + "T00:00:00.000Z",
    });
  }

  // If there is only 1 point or we couldn't calculate change_percent for some reason
  if (indicesToInsert.length === 0 && latestData.length > 0) {
    for (const current of latestData) {
      indicesToInsert.push({
        ticker: "CNN_FG",
        current_price: current.y,
        change_percent: 0,
        base_date:
          new Date(current.x).toISOString().split("T")[0] + "T00:00:00.000Z",
      });
    }
  }

  // 4. Upsert into database
  const vixResult = await fetchVix();
  await upsertEconomyIndices(adminClient, [...indicesToInsert, vixResult]);

  return indicesToInsert;
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    await syncMarketFear();
    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Error fetching CNN Fear & Greed index:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
