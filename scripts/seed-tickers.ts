import "dotenv/config";

import { syncUSStockMasters } from "../app/core/lib/tickers-service.server";

async function run() {
  try {
    await syncUSStockMasters();
    process.exit(0);
  } catch (error) {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  }
}

run();
