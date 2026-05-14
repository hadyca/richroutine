import type { Route } from "./+types/dashboard";

import { Activity, Briefcase, LayoutDashboard, TrendingUp } from "lucide-react";
import { DateTime } from "luxon";
import { useOutletContext } from "react-router";

import { Separator } from "~/core/components/ui/separator";
import {
  fetchKRStockPrice,
  fetchUSStockPrice,
} from "~/core/lib/economy-service.server";
import makeServerClient from "~/core/lib/supa-client.server";
import {
  addToWatchlist,
  removeFromWatchlist,
  toggleAiNews,
  updateWatchlistItem,
  updateTickerPrice,
} from "~/features/news/mutations";
import {
  getLatestEconomyIndices,
  getTickerMarketAndExchange,
  getUserWatchlist,
  getUserPortfolioNews,
} from "~/features/news/queries";
import { PortfolioNewsCard } from "~/features/users/components/portfolio-news-card";
import { StatCard } from "~/features/users/components/stat-card";
import { WatchlistCard } from "~/features/users/components/watchlist-card";
import { getLoggedInUserId } from "~/features/users/queries";

export const meta: Route.MetaFunction = () => {
  return [{ title: `대시보드 | ${import.meta.env.VITE_APP_NAME}` }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client, headers] = makeServerClient(request);
  const userId = await getLoggedInUserId(client);

  const [economyIndices, watchlist, portfolioNews] = await Promise.all([
    getLatestEconomyIndices(client),
    getUserWatchlist(client, userId),
    getUserPortfolioNews(client, userId),
  ]);

  return Response.json(
    {
      economyIndices,
      watchlist,
      portfolioNews,
    },
    { headers },
  );
}

export async function action({ request }: Route.ActionArgs) {
  const [client, headers] = makeServerClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add") {
    const ticker = formData.get("ticker") as string;
    const quantity = Number(formData.get("quantity") || 0);
    const avgPrice = Number(formData.get("avg_price") || 0);

    await addToWatchlist(client, userId, ticker, quantity, avgPrice);

    const tickerData = await getTickerMarketAndExchange(client, ticker);

    let currentPrice: number | null = null;

    if (tickerData?.market === "US") {
      const priceData = await fetchUSStockPrice(ticker, tickerData.exchange);
      currentPrice = priceData?.current_price;
    } else if (tickerData?.market === "KR") {
      const priceData = await fetchKRStockPrice(ticker);
      currentPrice = priceData?.current_price;
    }

    if (currentPrice !== null) {
      await updateTickerPrice(client, ticker, currentPrice);
    }
  } else if (intent === "toggle_ai_news") {
    const ticker = formData.get("ticker") as string;
    const checked = formData.get("checked") === "true";

    // 구독 추가 시 최대 3개 제한 체크
    if (checked) {
      const { data: currentSubs } = await client
        .from("watchlists")
        .select("ticker")
        .eq("profile_id", userId)
        .eq("is_ai_news_subscribed", true);

      if (currentSubs && currentSubs.length >= 3) {
        return Response.json(
          { error: "max_subscriptions", intent: "toggle_ai_news" },
          { headers },
        );
      }
    }

    await toggleAiNews(client, userId, ticker, checked);
  } else if (intent === "update") {
    const ticker = formData.get("ticker") as string;
    const quantity = Number(formData.get("quantity") || 0);
    const avgPrice = Number(formData.get("avg_price") || 0);
    await updateWatchlistItem(client, userId, ticker, quantity, avgPrice);
  } else if (intent === "remove") {
    const ticker = formData.get("ticker") as string;
    await removeFromWatchlist(client, userId, ticker);
  }

  return Response.json({ success: true }, { headers });
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { subscriptionType, exchangeRate } = useOutletContext<{
    subscriptionType: string;
    exchangeRate: number;
  }>();

  const { economyIndices, watchlist, portfolioNews } = loaderData as any;

  const getIndexHistory = (ticker: string) => {
    return (economyIndices || [])
      .filter((idx: any) => idx.ticker === ticker)
      .sort(
        (a: any, b: any) =>
          DateTime.fromISO(b.base_date).toMillis() -
          DateTime.fromISO(a.base_date).toMillis(),
      )
      .slice(0, 6)
      .reverse();
  };
  const stats = [
    {
      ticker: "CNN_FG",
      label: "CNN 공포 & 탐욕 지수",
      value: getIndexHistory("CNN_FG"),
      description:
        "CNN 공포 & 탐욕 지수는 주식 시장에서 투자 심리를 0~100 범위로 수치화한 지표로, 값이 낮을수록 '공포(Fear)', 높을수록 '탐욕(Greed)' 상태를 뜻합니다.\n\n0~24: 극도의 공포 \n25~44: 공포 \n45~55: 중립 \n56~75: 탐욕 \n76~100: 극도의 탐욕",
    },
    {
      ticker: "VIX",
      label: "VIX (미국 공포 지수)",
      value: getIndexHistory("VIX"),
      description:
        "S&P 500 지수 옵션 가격에 기반한 미국 시장 변동성 지수입니다. 값이 낮을수록 시장이 안도하고, 높을수록 불안한 상태를 뜻합니다.\n\n20↓(낮음): 시장 안도 및 저변동성 구간 \n20~30(보통): 정상적인 변동성 범위 \n30↑(높음): 극도의 불확실성 구간",
    },
  ];

  const newsItems = (portfolioNews || []).map((news: any) => {
    const publishTime = (news.provider_publish_time || 0) * 1000;
    const timeAgo = publishTime
      ? DateTime.fromMillis(publishTime).toRelative({ locale: "ko" })
      : "방금 전";

    let tickerName = news.ticker;
    if (news.tickers) {
      if (news.tickers.market === "KR" && news.tickers.name_ko) {
        tickerName = news.tickers.name_ko;
      }
    }

    return {
      id: news.portfolio_news_id.toString(),
      ticker: tickerName,
      title: news.title,
      timeAgo: timeAgo || "방금 전",
      url: news.url,
      source: news.publisher || "알 수 없음",
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-primary flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7" />
            <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">시장 심리 지표</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <div className="flex items-center gap-2 pt-8">
        <Briefcase className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">포트폴리오</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="min-w-0 md:col-span-2">
          <WatchlistCard
            subscriptionType={subscriptionType}
            watchlist={watchlist}
            exchangeRate={exchangeRate}
          />
        </div>
        <PortfolioNewsCard news={newsItems} />
      </div>
    </div>
  );
}
