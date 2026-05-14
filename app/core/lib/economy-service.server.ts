import axios from "axios";
import { DateTime } from "luxon";
import YahooFinance from "yahoo-finance2";

import adminClient from "~/core/lib/supa-admin-client.server";
import { upsertProviderToken } from "~/features/news/mutations";
import { getProviderToken } from "~/features/news/queries";

/**
 * KIS 액세스 토큰 가져오기 (캐싱 로직 포함)
 */
async function getKisAccessToken() {
  const now = new Date();

  // 1. DB에서 기존 토큰 조회
  const existingToken = await getProviderToken(adminClient, "KIS");

  // 2. 토큰이 존재하고 만료되지 않았으면 반환
  if (
    existingToken &&
    existingToken.expires_at &&
    now < new Date(existingToken.expires_at)
  ) {
    return existingToken.access_token;
  }

  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const response = await axios.post(
        "https://openapi.koreainvestment.com:9443/oauth2/tokenP",
        {
          grant_type: "client_credentials",
          appkey: process.env.KIS_APP_KEY,
          appsecret: process.env.KIS_APP_SECRET,
        },
      );

      const { access_token, access_token_token_expired } = response.data;

      // KIS 날짜 형식 "YYYY-MM-DD HH:MM:SS"을 한국 시간(KST)으로 정확히 파싱
      const expiredDate = DateTime.fromFormat(
        access_token_token_expired,
        "yyyy-MM-dd HH:mm:ss",
        { zone: "Asia/Seoul" },
      ).toJSDate();

      // 3. DB에 토큰 정보 Upsert (저장/갱신)
      await upsertProviderToken(adminClient, "KIS", access_token, expiredDate);

      console.log(
        `✅ KIS 토큰 DB 갱신 성공 (만료: ${access_token_token_expired})`,
      );
      return access_token;
    } catch (error) {
      retries--;
      lastError = error instanceof Error ? error : new Error(String(error));
      if (retries === 0)
        throw new Error(`KIS 토큰 발급 실패: ${lastError.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error("알 수 없는 토큰 발급 에러");
}

/**
 * 1. VIX 지수 조회 (Yahoo Finance)
 */
export async function fetchVix() {
  const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
  const quote = await yahooFinance.quote("^VIX");
  return {
    ticker: "VIX",
    current_price: Number(quote.regularMarketPrice),
    change_percent: Number(quote.regularMarketChangePercent),
    base_date: quote.regularMarketTime
      ? DateTime.fromJSDate(quote.regularMarketTime)
          .setZone("America/New_York")
          .toISODate() + "T00:00:00.000Z"
      : DateTime.now().toISODate() + "T00:00:00.000Z",
  };
}

/**
 * 4. 해외 주식 (미국) 현재가 상세조회 (KIS API)
 */
export async function fetchUSStockPrice(ticker: string, exchange: string) {
  const token = await getKisAccessToken();

  // exchange 값에 따른 EXCD 맵핑
  let excd = "NAS";
  if (exchange.includes("뉴욕") || exchange.includes("NYS")) {
    excd = "NYS";
  } else if (exchange.includes("아멕스") || exchange.includes("AMS")) {
    excd = "AMS";
  }

  const response = await axios.get(
    "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/price-detail",
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${token}`,
        appkey: process.env.KIS_APP_KEY,
        appsecret: process.env.KIS_APP_SECRET,
        custtype: "P",
        tr_id: "HHDFS76200200",
      },
      params: {
        AUTH: "",
        EXCD: excd,
        SYMB: ticker,
      },
    },
  );

  const data = response.data;
  if (data.rt_cd !== "0" || !data.output) {
    throw new Error(`미국주식 조회 에러 (${ticker}): ${data.msg1}`);
  }

  return {
    current_price: Number(data.output.last),
  };
}
/**
 * 5. 국내 주식 (한국) 현재가 상세조회 (KIS API)
 */
export async function fetchKRStockPrice(ticker: string) {
  const token = await getKisAccessToken();

  const response = await axios.get(
    "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price",
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${token}`,
        appkey: process.env.KIS_APP_KEY,
        appsecret: process.env.KIS_APP_SECRET,
        tr_id: "FHKST01010100",
      },
      params: {
        FID_COND_MRKT_DIV_CODE: "J",
        FID_INPUT_ISCD: ticker,
      },
    },
  );

  const data = response.data;
  if (data.rt_cd !== "0" || !data.output) {
    throw new Error(`한국주식 조회 에러 (${ticker}): ${data.msg1}`);
  }

  return {
    current_price: Number(data.output.stck_prpr),
  };
}
