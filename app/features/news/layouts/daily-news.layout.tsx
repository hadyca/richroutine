import type { Route } from "./+types/daily-news.layout";

import { DateTime } from "luxon";
import { Link, Outlet, data, useLoaderData } from "react-router";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Separator } from "~/core/components/ui/separator";
import makeServerClient from "~/core/lib/supa-client.server";
import { getEconomyNewsByCategory } from "~/features/news/queries";

const paramsSchema = z.object({
  year: z.coerce.number(),
  month: z.coerce.number(),
  day: z.coerce.number(),
});

const CATEGORY_MAP: Record<string, { title: string }> = {
  "us-stocks": {
    title: "미국 증시 뉴스",
  },
  "kr-stocks": {
    title: "국내 증시 뉴스",
  },
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data: parsedData } = paramsSchema.safeParse(params);

  const url = new URL(request.url);
  const categoryMatch = url.pathname.match(/\/(us-stocks|kr-stocks)\//);
  const category = categoryMatch ? categoryMatch[1] : "us-stocks";

  if (!success) {
    throw data(
      {
        error_code: "invalid_params",
        message: "Invalid params",
      },
      { status: 400 },
    );
  }

  const { year, month, day } = parsedData;
  const date = DateTime.fromObject(
    { year, month, day },
    { zone: "Asia/Seoul" },
  );
  if (!date.isValid) {
    throw data(
      {
        error_code: "invalid_date",
        message: "Invalid date",
      },
      {
        status: 400,
      },
    );
  }

  const today = DateTime.now().setZone("Asia/Seoul").startOf("day");
  if (date > today) {
    throw data(
      {
        error_code: "future_date",
        message: "Future date",
      },
      { status: 400 },
    );
  }

  const [client] = makeServerClient(request);
  const dbCategoryMap: Record<string, string> = {
    "us-stocks": "US_STOCK",
    "kr-stocks": "KR_STOCK",
  };

  const newsData = await getEconomyNewsByCategory(
    client,
    dbCategoryMap[category],
  );

  return { ...parsedData, category, newsData };
};

export default function DailyNewsLayout() {
  const loaderData = useLoaderData<typeof loader>();
  const { category, year, month, day, newsData } = loaderData;
  const categoryInfo = CATEGORY_MAP[category];

  const dateObj = DateTime.fromObject({ year, month, day }).setZone(
    "Asia/Seoul",
  );

  const todayStr = dateObj.setLocale("ko").toLocaleString({
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const lastUpdatedAt = newsData?.[0]?.updated_at;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-primary flex items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {categoryInfo.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{todayStr}</p>
            {lastUpdatedAt && (
              <div className="flex items-center gap-1.5">
                <span className="text-foreground font-mono text-[9px] font-bold uppercase">
                  (뉴스 업데이트 :{" "}
                  {DateTime.fromISO(lastUpdatedAt, { zone: "utc" })
                    .setZone("Asia/Seoul")
                    .toFormat("yyyy.MM.dd HH:mm:ss")}
                  )
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Main News Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">주요 뉴스 (Top 5)</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {newsData?.map((news, idx) => (
            <Link
              key={news.economy_news_id}
              to={news.url}
              className="h-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="hover:border-primary/50 h-full">
                <CardHeader>
                  <CardTitle className="leading-tight">
                    {idx + 1}. {news.headline}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{news.summary}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Page Content goes here */}
      <Outlet />

      <div className="text-muted-foreground mt-6 text-center text-[10px] italic">
        본 정보는 AI가 수집/요약한 정보로 투자 결과에 대한 법적 책임의 근거로
        활용될 수 없습니다.
      </div>
    </div>
  );
}
