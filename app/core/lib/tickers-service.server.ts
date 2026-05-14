import AdmZip from "adm-zip";
import axios from "axios";
import { sql } from "drizzle-orm";
import iconv from "iconv-lite";

import db from "~/core/db/drizzle-client.server";
import { tickers } from "~/features/news/schema";

const MASTER_URL_BASE = "https://new.real.download.dws.co.kr/common/master/";

interface MasterConfig {
  code: string;
  market: "KR" | "US";
  fileName?: string;
}

const MARKET_CONFIGS: MasterConfig[] = [
  { code: "nas", market: "US", fileName: "nasmst.cod" },
  { code: "nys", market: "US", fileName: "nysmst.cod" },
  { code: "ams", market: "US", fileName: "amsmst.cod" },
  { code: "kospi_code", market: "KR", fileName: "kospi_code.mst" },
  { code: "kosdaq_code", market: "KR", fileName: "kosdaq_code.mst" },
];

export async function syncMarketTickers(marketCode: string) {
  const config = MARKET_CONFIGS.find((m) => m.code === marketCode);
  if (!config) {
    throw new Error(`Invalid market code: ${marketCode}`);
  }

  console.log(`🚀 Starting sync for ${config.code.toUpperCase()}...`);

  try {
    const url = `${MASTER_URL_BASE}${config.code}${config.market === "US" ? "mst.cod.zip" : ".mst.zip"}`;
    console.log(
      `📡 Downloading ${config.code.toUpperCase()} master from ${url}...`,
    );

    const response = await axios.get(url, { responseType: "arraybuffer" });
    const zip = new AdmZip(Buffer.from(response.data));
    const zipEntries = zip.getEntries();

    const fileName = config.fileName!;
    const entry = zipEntries.find(
      (e) => e.entryName.toLowerCase() === fileName.toLowerCase(),
    );

    if (!entry) {
      throw new Error(`❌ Could not find ${fileName} in zip`);
    }

    const content = iconv.decode(entry.getData(), "cp949");
    const lines = content.split("\n");

    console.log(
      `📄 Parsing ${lines.length} lines for ${config.code.toUpperCase()}...`,
    );

    const recordsToUpsert = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      let tickerCode = "";
      let nameKo = "";
      let nameEn: string | null = null;
      let exchange = "";

      if (config.market === "US") {
        const cols = line.split("\t");
        if (cols.length < 10) continue;

        exchange = cols[3]?.trim() || "US Market";
        tickerCode = cols[4]?.trim();
        nameKo = cols[6]?.trim();
        nameEn = cols[7]?.trim();
        const typeCode = cols[8]?.trim(); // 2: Stock, 3: ETP(ETF)

        if (typeCode !== "2" && typeCode !== "3") continue;
      } else {
        /**
         * KR Market parsing logic (Fixed width based on KIS Python examples)
         *
         * KOSPI (kis_kospi_code_mst.py):
         * rf1 = row[0:len(row) - 228]
         * rf1_1 (Code) = rf1[0:9].rstrip()
         * rf1_3 (Name) = rf1[21:].strip()
         *
         * KOSDAQ (kis_kosdaq_code_mst.py):
         * rf1 = row[0:len(row) - 222]
         * rf1_1 (Code) = rf1[0:9].rstrip()
         * rf1_3 (Name) = rf1[21:].strip()
         */
        const endOffset = config.code === "kospi_code" ? 228 : 222;
        if (line.length <= endOffset + 21) continue;

        const mainPart = line.substring(0, line.length - endOffset);
        tickerCode = mainPart.substring(0, 9).trim();
        nameKo = mainPart.substring(21).trim();
        nameEn = null;
        exchange = config.code === "kospi_code" ? "KOSPI" : "KOSDAQ";
      }

      if (!tickerCode || (!nameEn && !nameKo)) continue;

      recordsToUpsert.push({
        ticker: tickerCode,
        name_en: nameEn,
        name_ko: nameKo || null,
        market: config.market,
        exchange: exchange,
        updated_at: new Date(),
      });
    }

    const CHUNK_SIZE = 500;
    for (let i = 0; i < recordsToUpsert.length; i += CHUNK_SIZE) {
      const chunk = recordsToUpsert.slice(i, i + CHUNK_SIZE);
      await db
        .insert(tickers)
        .values(chunk)
        .onConflictDoUpdate({
          target: tickers.ticker,
          set: {
            name_en: sql`excluded.name_en`,
            name_ko: sql`excluded.name_ko`,
            market: sql`excluded.market`,
            exchange: sql`excluded.exchange`,
            updated_at: sql`now()`,
          },
        });
    }

    console.log(
      `✅ Successfully synced ${recordsToUpsert.length} tickers for ${config.code.toUpperCase()}`,
    );
    return recordsToUpsert.length;
  } catch (error) {
    console.error(`❌ Error syncing ${config.code.toUpperCase()}:`, error);
    throw error;
  }
}

export async function syncUSStockMasters() {
  console.log("🚀 Starting all US Stock markets sync...");
  const usMarkets = MARKET_CONFIGS.filter((m) => m.market === "US");
  for (const config of usMarkets) {
    try {
      await syncMarketTickers(config.code);
    } catch (error) {
      // Continue to next market even if one fails
    }
  }
  console.log("🏁 All US Stock markets sync completed.");
}
