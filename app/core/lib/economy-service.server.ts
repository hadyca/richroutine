import axios from "axios";
import { DateTime } from "luxon";
import YahooFinance from "yahoo-finance2";

// KIS 토큰 캐싱을 위한 전역 변수
let cachedToken: string | null = null;
let tokenExpiredAt: Date | null = null;

/**
 * 1. VIX 지수 조회 (Yahoo Finance)
 */
export async function fetchVix() {
  const yahooFinance = new YahooFinance();
  const quote = await yahooFinance.quote("^VIX");
  return {
    symbol: "VIX",
    current_price: Number(quote.regularMarketPrice),
    change_percent: Number(quote.regularMarketChangePercent),
    base_date: quote.regularMarketTime
      ? DateTime.fromJSDate(quote.regularMarketTime)
          .setZone("America/New_York")
          .toISO()
      : DateTime.now().toISO(),
  };
}

/**
 * 2. VKOSPI 지수 조회 (KIS API)
 */

export async function fetchVkospi() {
  if (!cachedToken || !tokenExpiredAt || new Date() >= tokenExpiredAt) {
    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        const tokenResponse = await axios.post(
          "https://openapi.koreainvestment.com:9443/oauth2/tokenP",
          {
            grant_type: "client_credentials",
            appkey: process.env.KIS_APP_KEY,
            appsecret: process.env.KIS_APP_SECRET,
          },
        );
        cachedToken = tokenResponse.data.access_token;
        tokenExpiredAt = new Date(
          tokenResponse.data.access_token_token_expired,
        );
        console.log("✅ KIS 토큰 발급 성공");
        break;
      } catch (error) {
        retries--;
        lastError = error instanceof Error ? error : new Error(String(error));
        if (retries === 0)
          throw new Error(`KIS 토큰 발급 실패: ${lastError.message}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  const response = await axios.get(
    "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-price",
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${cachedToken}`,
        appkey: process.env.KIS_APP_KEY,
        appsecret: process.env.KIS_APP_SECRET,
        tr_id: "FHPUP02100000",
      },
      params: {
        FID_COND_MRKT_DIV_CODE: "U",
        FID_INPUT_ISCD: "0503",
      },
    },
  );

  const data = response.data;
  if (data.rt_cd !== "0" || !data.output) {
    throw new Error(`VKOSPI API 에러: ${data.msg1}`);
  }

  return {
    symbol: "VKOSPI",
    current_price: Number(data.output.bstp_nmix_prpr),
    change_percent: Number(data.output.bstp_nmix_prdy_ctrt),
    base_date: data.output.stck_bsop_date
      ? DateTime.fromFormat(data.output.stck_bsop_date, "yyyyMMdd").toISO()
      : DateTime.now().toISO(),
  };
}

/**
 * 3. KB 매수우위지수 (서울) 조회
 */
export async function fetchKbIndex() {
  const response = await axios.get(
    "https://data-api.kbland.kr/bfmstat/weekMnthlyHuseTrnd/maktTrnd",
    {
      params: { 메뉴코드: "01", 월간주간구분코드: "02" },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    },
  );

  const kbDataBody = response.data?.dataBody?.data;
  const kbDateList = kbDataBody?.["날짜리스트"];
  const kbDataList = kbDataBody?.["데이터리스트"];

  if (!kbDateList || !kbDataList) {
    throw new Error("KB 데이터를 가져올 수 없습니다.");
  }

  const seoulData = kbDataList.find(
    (item: any) => item["지역코드"] === "1100000000",
  );

  if (!seoulData || !seoulData.dataList || seoulData.dataList.length < 2) {
    throw new Error("서울 매수우위지수 데이터를 찾을 수 없거나 부족합니다.");
  }

  const lastIdx = kbDateList.length - 1;
  const kbLatest = seoulData.dataList[lastIdx];
  const kbPrevious = seoulData.dataList[lastIdx - 1];

  const kbCurrentPrice = Number(kbLatest["매수우위지수"]);
  const kbPrevPrice = Number(kbPrevious["매수우위지수"]);
  const kbChangePercent =
    kbPrevPrice !== 0
      ? ((kbCurrentPrice - kbPrevPrice) / kbPrevPrice) * 100
      : 0;

  return {
    symbol: "KB",
    current_price: kbCurrentPrice,
    change_percent: kbChangePercent,
    base_date: DateTime.fromFormat(kbLatest["기준날짜"], "yyyyMMdd").toISO(),
  };
}
