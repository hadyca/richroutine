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
 * Threads 액세스 토큰 가져오기 (캐싱 및 만료 전 자동 연장 포함)
 */
export async function getThreadsAccessToken() {
  const now = new Date();

  // 1. DB에서 기존 Threads 토큰 조회
  const existingToken = await getProviderToken(adminClient, "THREADS");

  // 2. 토큰이 아예 없는 경우
  if (!existingToken) {
    throw new Error(
      "Threads 토큰이 DB에 존재하지 않습니다. 먼저 초기 토큰을 등록해 주세요.",
    );
  }

  const expiresAt = existingToken.expires_at
    ? new Date(existingToken.expires_at)
    : null;

  // 3. 토큰이 존재하지만 이미 만료된 경우 (갱신 불가능하므로 재로그인 필요)
  if (expiresAt && now >= expiresAt) {
    throw new Error(
      "Threads 토큰이 만료되었습니다. 새로운 단기 토큰을 발급받아 재등록해야 합니다.",
    );
  }

  // 4. 만료 기간이 넉넉히 남아있는 경우 (예: 10일 이상 남음) -> 기존 토큰 반환
  // Threads 장기 토큰은 보통 60일 유효하며 만료 10일 전에 자동으로 갱신하도록 설계합니다.
  const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
  if (expiresAt && expiresAt.getTime() - now.getTime() > tenDaysInMs) {
    return existingToken.access_token;
  }

  // 5. 만료 기간이 임박한 경우 (10일 이내) -> API를 호출하여 토큰 자동 갱신
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const response = await axios.get(
        "https://graph.threads.net/refresh_access_token",
        {
          params: {
            grant_type: "th_refresh_token",
            access_token: existingToken.access_token,
          },
        },
      );

      const { access_token, expires_in } = response.data;

      // 새 만료 날짜 계산 (현재 시간 + expires_in 초)
      const expiredDate = new Date(now.getTime() + expires_in * 1000);

      // DB에 토큰 정보 Upsert (저장/갱신)
      await upsertProviderToken(
        adminClient,
        "THREADS",
        access_token,
        expiredDate,
      );

      console.log(
        `✅ Threads 토큰 자동 갱신 성공 (만료일: ${expiredDate.toISOString()})`,
      );
      return access_token;
    } catch (error) {
      retries--;
      lastError = error instanceof Error ? error : new Error(String(error));
      if (retries === 0) {
        throw new Error(`Threads 토큰 갱신 실패: ${lastError.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error("알 수 없는 Threads 토큰 갱신 에러");
}

/**
 * 최초로 발급받은 Threads 단기 토큰(Short-Lived)을 장기 토큰(Long-Lived)으로 교환하여 DB에 저장
 */
export async function exchangeAndSaveThreadsToken(shortLivedToken: string) {
  const appSecret = process.env.THREADS_APP_SECRET;

  if (!appSecret) {
    throw new Error("THREADS_APP_SECRET 환경변수가 설정되지 않았습니다.");
  }

  try {
    console.log("시작!");
    const response = await axios.get("https://graph.threads.net/access_token", {
      params: {
        grant_type: "th_exchange_token",
        client_secret: appSecret,
        access_token: shortLivedToken,
      },
    });
    console.log("끝!");

    const { access_token, expires_in } = response.data;
    const expiredDate = new Date(Date.now() + expires_in * 1000);

    await upsertProviderToken(
      adminClient,
      "THREADS",
      access_token,
      expiredDate,
    );
    console.log(
      `✅ Threads 장기 토큰 등록 성공 (만료: ${expiredDate.toISOString()})`,
    );
    // return access_token;
  } catch (error: any) {
    console.error("Threads 장기 토큰 교환 실패:", error.message);
    throw error;
  }
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

/**
 * Threads에 텍스트 포스트 게시하기
 */
async function createThreadsContainer(
  token: string,
  text: string,
  replyToId?: string,
) {
  const containerResponse = await axios.post(
    "https://graph.threads.net/v1.0/me/threads",
    null,

    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        media_type: "TEXT",
        text: text,
        ...(replyToId && { reply_to_id: replyToId }),
      },
    },
  );

  const creationId = containerResponse.data.id;
  if (!creationId) {
    throw new Error("Threads 미디어 컨테이너 생성 실패 (ID가 없습니다.)");
  }
  return creationId;
}

export async function postTextToThreads(text: string) {
  const token = await getThreadsAccessToken();

  try {
    // 1. Threads 미디어 컨테이너 생성 (TEXT 타입)
    const creationId = await createThreadsContainer(token, text);

    // 2. 생성된 컨테이너 퍼블리싱 (게시)
    const publishResponse = await axios.post(
      "https://graph.threads.net/v1.0/me/threads_publish",
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          creation_id: creationId,
        },
      },
    );

    const postId = publishResponse.data.id;
    console.log(`✅ Threads 포스팅 성공! Post ID: ${postId}`);
    return postId;
  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    console.error("❌ Threads 포스팅 실패:", errorData);
    throw new Error(`Threads 포스팅 실패: ${JSON.stringify(errorData)}`);
  }
}

export async function postReplyToThreads(text: string, replyToId: string) {
  const token = await getThreadsAccessToken();
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 1. Threads 미디어 컨테이너 생성 (TEXT 타입)
      const creationId = await createThreadsContainer(token, text, replyToId);

      // 2. 컨테이너 퍼블리시 전 잠시 대기 (서버 인덱싱 시간 확보)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. 생성된 컨테이너 퍼블리싱 (게시)
      const publishResponse = await axios.post(
        "https://graph.threads.net/v1.0/me/threads_publish",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            creation_id: creationId,
          },
        },
      );

      const postId = publishResponse.data.id;
      console.log(`✅ Threads 댓글 성공! Post ID: ${postId}`);
      return postId;
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      const isMediaNotFound = error.response?.data?.error?.error_subcode === 4279009;

      if (isMediaNotFound && attempt < MAX_RETRIES) {
        const waitMs = attempt * 5000; // 5초, 10초, 15초 점진적 대기
        console.log(
          `⏳ 댓글 퍼블리시 실패 (시도 ${attempt}/${MAX_RETRIES}), ${waitMs / 1000}초 후 재시도...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      console.error("❌ Threads 댓글 실패:", errorData);
      throw new Error(`Threads 댓글 실패: ${JSON.stringify(errorData)}`);
    }
  }
}
