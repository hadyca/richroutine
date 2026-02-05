import type { Route } from "./+types/daily-news";

import { BarChart3, Globe, Lightbulb, Newspaper } from "lucide-react";
import { DateTime } from "luxon";
import { Link, data, isRouteErrorResponse } from "react-router";
import { z } from "zod";

import { Badge } from "~/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Separator } from "~/core/components/ui/separator";

const paramsSchema = z.object({
  year: z.coerce.number(),
  month: z.coerce.number(),
  day: z.coerce.number(),
});

export const meta: Route.MetaFunction = ({ params }) => {
  const date = DateTime.fromObject({
    year: Number(params.year),
    month: Number(params.month),
    day: Number(params.day),
  })
    .setZone("Asia/Seoul")
    .setLocale("ko");
  return [
    {
      title: `오늘의 뉴스 | ${date.toLocaleString(
        DateTime.DATE_MED,
      )} | RichRoutine`,
    },
  ];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { success, data: parsedData } = paramsSchema.safeParse(params);

  if (!success) {
    throw data(
      {
        error_code: "invalid_params",
        message: "Invalid params",
      },
      { status: 400 },
    );
  }
  const date = DateTime.fromObject(parsedData).setZone("Asia/Seoul");
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

  return { ...parsedData };
};

const newsData = [
  {
    id: 1,
    title: "차기 연준 의장 케빈 워시(Kevin Warsh) 지명 파생 여파",
    content:
      "워시 지명자는 과거 양적완화에 비판적이었던 매파적 성향으로 분류되며, 이에 따라 미 국채 10년물 금리가 장중 상승 압력을 받았고 달러 인덱스는 103선을 회복하며 강세를 보이고 있습니다.",
    url: "https://www.hankyung.com/article/202602058851i",
  },
  {
    id: 2,
    title: "빅테크 실적 '옥석 가리기' 심화... 알파벳(GOOGL) 발표 임박",
    content:
      "지난주 MSFT와 TSLA가 실적 발표 후 자본지출 우려로 하락한 반면, 메타는 가이던스 상향으로 급등하며 기술주 내 차별화가 진행 중입니다.",
    url: "https://www.hankyung.com/article/202602058851i",
  },
  {
    id: 3,
    title: "S&P 500 지수 7,000선 돌파 후 차익 실현 매물 출회",
    content:
      "사상 처음으로 7,000포인트를 돌파했으나, 과매수권 진입에 따른 기술적 부담으로 인해 나스닥 선물(NQ)이 장중 1.0% 하락하는 등 강한 조정을 받고 있습니다.",
    url: "https://www.hankyung.com/article/202602058851i",
  },
  {
    id: 4,
    title: "비트코인 및 안전자산 급락... 위험회피 심리 확산",
    content:
      "비트코인이 8만 달러 선을 내주며 77,000달러대로 하락했고, 금 가격 역시 케빈 워시의 매파적 행보 전망에 따른 달러 강세 여파로 조정을 보였습니다.",

    url: "https://www.hankyung.com/article/202602058851i",
  },
  {
    id: 5,
    title: "12월 생산자물가지수(PPI) 예상치 상회... 인플레이션 끈적임",
    content:
      "미국 12월 PPI가 전월 대비 +0.5% 기록하며 예상치(+0.2%)를 상회했습니다. 인플레이션 하방 경직성을 시연하며 상반기 금리 인하 중단 가능성을 높이고 있습니다.",
    url: "https://www.hankyung.com/article/202602058851i",
  },
];

const tickerData = [
  {
    id: 1,
    symbol: "GOOGL",
    status: "단기 변동성 높음",
    description:
      "현재 주가 약 338.53달러. 2월 4일 실적 발표를 앞두고 옵션 변동성이 확대되고 있습니다. 광고 시장 민감도와 규제 이슈로 실적 발표 당일 ±5% 이상의 변동성이 예상됩니다.",
  },
  {
    id: 2,
    symbol: "QQQ",
    status: "저항 구간 진입",
    description:
      "나스닥 100 지수가 26,000선 부근에서 더블탑 패턴을 형성 중입니다. QQQ 주가는 621.87달러로 하락 압력을 받고 있어 실적 시즌 종료 시까지는 보수적인 접근이 필요합니다.",
  },
];

const strategyTags = ["현금 비중 30%", "방어적 스탠스", "분할 매도"];

export default function TodayNews({ loaderData }: Route.ComponentProps) {
  // Parse the ISO date string from loader
  const dateObj = DateTime.fromObject(loaderData).setZone("Asia/Seoul");

  const today = dateObj.setLocale("ko").toLocaleString({
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-primary flex items-center gap-2">
            <Newspaper className="h-7 w-7" />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              오늘의 뉴스
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm">{today}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main News Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold">
            미국 증시 및 경제 주요 뉴스 (Top 5)
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {newsData.map((news) => (
            <Link key={news.id} to={news.url} className="h-full">
              <Card className="hover:border-primary/50 h-full">
                <CardHeader>
                  <CardTitle className="leading-tight">
                    {news.id}. {news.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {news.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Impact Section */}
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 text-blue-500 dark:bg-blue-900/40 dark:text-blue-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>내 관심 종목에 미치는 영향</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickerData.map((stock) => (
                <Card key={stock.id}>
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{stock.symbol}</span>
                      <Badge>{stock.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground -mt-4 pt-0 text-sm leading-relaxed">
                    {stock.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expert Opinion */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 text-blue-500 dark:bg-blue-900/40 dark:text-blue-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>리치루틴 전문가 의견</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <blockquote className="border-primary border-l-4 pl-4 text-lg leading-relaxed font-medium italic">
              "현재는 &apos;기대&apos;가 &apos;증명&apos;으로 바뀌어야 하는
              구간입니다. 지수가 고점에 위치한 만큼, GOOGL의 경우 실적 쇼크 시
              하단 지지선인 310달러 선까지 열어두는 방어적 스탠스가 필요하며,
              QQQ는 분할 매도 후 현금 비중 30% 확보를 권고합니다."
            </blockquote>
            <Card className="mt-auto">
              <CardHeader>
                <CardTitle>투자 전략 요약</CardTitle>
              </CardHeader>
              <CardContent className="-mt-4">
                <div className="flex flex-wrap gap-2">
                  {strategyTags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      <div className="text-muted-foreground mt-6 text-center text-[10px] italic">
        본 정보는 AI가 수집/요약한 정보로 투자 결과에 대한 법적 책임의 근거로
        활용될 수 없습니다.
      </div>
    </div>
  );
}

// export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
//   if (isRouteErrorResponse(error)) {
//     return (
//       <div>
//         {error.data.message} / {error.data.error_code}
//       </div>
//     );
//   }
//   if (error instanceof Error) {
//     return <div>{error.message}</div>;
//   }
//   return <div>Unknown error</div>;
// }
