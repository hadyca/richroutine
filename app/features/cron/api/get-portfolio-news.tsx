import type { Route } from "./+types/get-portfolio-news";

import * as Sentry from "@sentry/react-router";
import axios from "axios";
import { data } from "react-router";

import adminClient from "~/core/lib/supa-admin-client.server";
import { upsertPortfolioNews } from "~/features/news/mutations";
import { getUniqueWatchlistTickers } from "~/features/news/queries";

export const action = async ({ request }: Route.ActionArgs) => {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    // 2. Watchlist 테이블에 있는 고유 티커 목록 가져오기
    const allTickers = await getUniqueWatchlistTickers(adminClient);
    // 3. 미국(US) 주식 티커만 필터링
    const usTickers = allTickers
      .filter((item) => item.tickers?.market === "US")
      .map((item) => item.ticker);
    console.log(`총 ${usTickers.length}개의 US 관심 종목 뉴스를 가져옵니다.`);

    const portfolioNews: any[] = [];

    // 4. 각 US 티커별로 Yahoo Finance API 호출
    for (const ticker of usTickers) {
      try {
        const response = await axios.get(
          `https://query2.finance.yahoo.com/v1/finance/search?q=${ticker}`,
        );

        const newsItems = (response.data?.news || []).sort(
          (a: any, b: any) =>
            (b.providerPublishTime || 0) - (a.providerPublishTime || 0),
        );

        const topNews = newsItems.slice(0, 3).map((item: any) => ({
          ticker,
          uuid: item.uuid,
          title: item.title,
          publisher: item.publisher,
          url: item.link,
          provider_publish_time: item.providerPublishTime,
        }));

        if (topNews.length > 0) {
          portfolioNews.push(...topNews);
        }

        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`[${ticker}] US 뉴스 가져오기 실패:`, err);
      }
    }

    // 5. 한국(KR) 주식 티커 필터링 및 네이버 뉴스 검색 API 호출
    const krTickers = allTickers.filter(
      (item) => item.tickers?.market === "KR",
    );
    console.log(`총 ${krTickers.length}개의 KR 관심 종목 뉴스를 가져옵니다.`);

    for (const item of krTickers) {
      const ticker = item.ticker;
      const query = item.tickers?.name_ko || ticker;

      try {
        const response = await axios.get(
          `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=3&sort=date`,
          {
            headers: {
              "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
              "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
            },
          },
        );

        const newsItems = response.data?.items || [];
        const topNews = newsItems.map((newsItem: any) => {
          const cleanTitle = newsItem.title
            .replace(/<[^>]*>?/g, "")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, "&");

          return {
            ticker,
            uuid: newsItem.link, // 고유 식별자로 링크 사용
            title: cleanTitle,
            publisher: "네이버 뉴스",
            url: newsItem.link,
            // provider_publish_time은 초 단위 Unix Timestamp
            provider_publish_time: Math.floor(
              new Date(newsItem.pubDate).getTime() / 1000,
            ),
          };
        });

        if (topNews.length > 0) {
          portfolioNews.push(...topNews);
        }

        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error(`[${ticker}] KR 뉴스 가져오기 실패:`, err);
      }
    }

    console.log(
      `총 ${portfolioNews.length}개의 개별 종목 뉴스를 수집했습니다.`,
    );

    if (portfolioNews.length > 0) {
      // ticker와 uuid의 조합을 기준으로 중복 제거 (만약의 동일 종목 내 중복 방지)
      const uniqueNews = Array.from(
        new Map(
          portfolioNews.map((item) => [`${item.ticker}_${item.uuid}`, item]),
        ).values(),
      );

      await upsertPortfolioNews(adminClient, uniqueNews);
      console.log(
        `포트폴리오 뉴스를 데이터베이스에 성공적으로 저장했습니다. (고유 뉴스: ${uniqueNews.length}개)`,
      );
    }

    // 6. 과거 데이터 청소 (7일이 지난 뉴스는 삭제)
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const { error: deleteError } = await adminClient
      .from("portfolio_news")
      .delete()
      .lt("provider_publish_time", sevenDaysAgo);

    if (deleteError) {
      console.error("오래된 포트폴리오 뉴스 삭제 중 에러 발생:", deleteError);
    } else {
      console.log("7일 이상 지난 오래된 포트폴리오 뉴스를 삭제했습니다.");
    }

    return Response.json({
      success: true,
      count: portfolioNews.length,
      data: portfolioNews,
    });
  } catch (error) {
    console.error("포트폴리오 뉴스 수집 에러:", error);
    Sentry.captureException(error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
};
