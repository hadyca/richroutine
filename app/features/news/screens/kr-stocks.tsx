import type { Route } from "./+types/kr-stocks";

import { Badge } from "~/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import makeServerClient from "~/core/lib/supa-client.server";
import {
  getLatestStockExpertOpinion,
  getLatestTickerAnalyses,
  getUserWatchlist,
} from "~/features/news/queries";
import { getLoggedInUserId } from "~/features/users/queries";

export const meta = () => {
  return [
    {
      title: "국내 증시 뉴스 | RichRoutine",
    },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [client] = makeServerClient(request);
  const userId = await getLoggedInUserId(client);

  // 1. Get user's full watchlist, filtered by AI news subscription
  const watchlist = (await getUserWatchlist(client, userId)).filter(
    (w: any) => w.is_ai_news_subscribed
  );

  // 2. Filter for KR market tickers only
  const krTickers = watchlist
    .filter((w: any) => w.tickers?.market === "KR")
    .map((w: any) => w.ticker);

  // 3. Fetch latest AI analyses for those specific tickers and the global expert opinion
  const [analyses, expertOpinion] = await Promise.all([
    getLatestTickerAnalyses(client, krTickers),
    getLatestStockExpertOpinion(client, userId, "KR"),
  ]);

  // 4. Map the analyses with the watchlist data format
  const analyzedTickers = watchlist
    .filter((w: any) => w.tickers?.market === "KR")
    .map((w: any) => {
      const ticker = w.ticker;
      const analysis = analyses[ticker];
      return {
        ticker,
        name: w.tickers?.name_ko || ticker,
        status: analysis?.status,
        description:
          analysis?.summary ||
          "아직 이 종목에 대한 AI 분석 결과가 없습니다. 매일 아침 7시에 분석 결과가 업데이트됩니다.",
      };
    });

  return { analyzedTickers, expertOpinion };
};

export default function KrStocksScreen({ loaderData }: Route.ComponentProps) {
  const { analyzedTickers, expertOpinion } = loaderData;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div>
            <CardTitle>내 관심 종목에 미치는 영향</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analyzedTickers.length > 0 ? (
            <div className="space-y-3">
              {analyzedTickers.map((stock: any) => (
                <Card key={stock.ticker}>
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{stock.name}</span>
                      {stock.status && <Badge>{stock.status}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="-mt-4 text-sm leading-relaxed whitespace-pre-line">
                    {stock.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground flex min-h-[200px] items-center justify-center text-center text-sm">
              대시보드 - 포트폴리오에서 'AI 종목 분석 구독'을 등록하고,
              <br />
              매일 아침 7시에 업데이트되는 분석 결과를 확인하세요.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expert Opinion */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center gap-3">
          <div>
            <CardTitle>종합 투자 의견</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-8">
          {expertOpinion?.summary ? (
            <p className="text-md leading-relaxed whitespace-pre-line">
              {expertOpinion?.summary}
            </p>
          ) : analyzedTickers.length === 0 ? (
            <div className="text-muted-foreground flex min-h-[200px] flex-1 items-center justify-center text-center text-sm whitespace-pre-line">
              대시보드 - 포트폴리오에서 'AI 종목 분석 구독'을 등록하고,
              <br />
              매일 아침 7시에 업데이트되는 분석 결과를 확인하세요.
            </div>
          ) : (
            <div className="text-muted-foreground flex min-h-[200px] flex-1 items-center justify-center text-center text-sm">
              매일 아침 7시에 업데이트됩니다.
            </div>
          )}
          {expertOpinion?.strategy_tags?.length ? (
            <Card className="mt-auto">
              <CardHeader>
                <CardTitle>투자 전략 요약</CardTitle>
              </CardHeader>
              <CardContent className="-mt-4">
                <div className="flex flex-wrap gap-2">
                  {expertOpinion.strategy_tags.map((tag: string) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
