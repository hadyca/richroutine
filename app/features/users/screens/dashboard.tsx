import type { Route } from "./+types/dashboard";

import { CircleQuestionMark, LayoutDashboard, Zap } from "lucide-react";

import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "~/core/components/ui/popover";
import { Separator } from "~/core/components/ui/separator";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Command Center | ${import.meta.env.VITE_APP_NAME}` }];
};

export default function Dashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-primary flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7" />
            <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            주요 지표 현황과 시장의 흐름을 한눈에 확인하세요.
          </p>
        </div>
      </div>

      <Separator />

      {/* Hero Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "VIX (미국 공포 지수)",
            value: "15.42",
            change: "+1.24%",
            description:
              "S&P 500 지수 옵션 가격에 기반한 미국 시장 변동성 지수입니다. \n\n20↓(낮음): 시장 낙관 및 안정 구간 \n20~30(보통): 정상적인 변동성 범위 \n30↑(높음): 시장 공포 및 과매도 국면",
          },
          {
            label: "VKOSPI (한국 공포 지수)",
            value: "18.25",
            change: "-0.45%",
            description:
              "KOSPI 200 옵션 가격을 바탕으로 산출되는 한국형 공포지수입니다. 국내 시장 참여자들의 불안 심리를 측정하는 척도로 쓰입니다. \n\n20↓(낮음): 시장 낙관 및 안정 구간 \n20~30(보통): 정상적인 변동성 범위 \n30↑(높음): 시장 공포 및 과매도 국면",
          },
          {
            label: "KB 부동산 매수우위지표(서울)",
            value: "32.8",
            change: "+2.1",
            description:
              "부동산 중개업소들이 체감하는 매수·매도세 비중입니다. \n\n100↑: 매수자가 많음 \n100↓: 매도자가 많음",
          },
          {
            label: "구독 등급",
            value: "PRO",
            change: "",
            description:
              "회원님의 현재 서비스 등급입니다. PRO 등급은 AI 시장 리포트 및 무제한 AI 변동성 시장 분석 기능을 제공합니다.",
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 text-nowrap">
              <span className="text-sm font-semibold">{stat.label}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <CircleQuestionMark className="h-4 w-4 cursor-help text-slate-400 transition-colors hover:text-slate-600" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <PopoverDescription className="text-xs leading-relaxed whitespace-pre-line">
                    {stat.description}
                  </PopoverDescription>
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div
                className={`mt-1 flex items-center ${stat.label.includes("구독 등급") ? "" : "gap-1.5"}`}
              >
                <span
                  className={`text-sm font-bold ${
                    stat.change.includes("+")
                      ? "text-red-500"
                      : stat.change.includes("-")
                        ? "text-blue-500"
                        : "text-primary"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  {stat.label.includes("구독 등급")
                    ? "2026-12-31 구독 갱신 예정"
                    : stat.label.includes("KB 부동산 매수우위지표(서울)")
                      ? "vs last week"
                      : "vs yesterday"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Intelligence Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />
                AI 변동성 시장 분석
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "VIX SUMMARY",
                  content:
                    "시장 변동성이 소폭 상승 중이나 여전히 안정권이며, 극단적 공포는 감지되지 않습니다.",
                  color: "bg-blue-500",
                },
                {
                  label: "VKOSPI SUMMARY",
                  content:
                    "국내 변동성 지수는 하향 안정화 추세로, 코스피 시장의 하방 경직성이 강화되고 있습니다.",
                  color: "bg-indigo-500",
                },
                {
                  label: "KB 지표 SUMMARY",
                  content:
                    "매수 세력이 점진적으로 유입되며 시장 심리가 위축 구간에서 점진적으로 벗어나고 있습니다.",
                  color: "bg-emerald-500",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                    <span className="text-xs font-bold tracking-tight text-slate-500">
                      {item.label}
                    </span>
                  </div>
                  <p className="border-l-2 border-slate-500 pl-3 text-sm leading-relaxed font-medium">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Watchlist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Watchlist</CardTitle>
            <CardDescription>
              오늘의 뉴스에 반영되는 종목입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-border divide-y px-6">
              {[
                {
                  ticker: "AAPL",
                  price: "242.12",
                  change: "+1.2%",
                  color: "text-emerald-500",
                },
                {
                  ticker: "TSLA",
                  price: "182.44",
                  change: "-2.4%",
                  color: "text-red-500",
                },
              ].map((item) => (
                <div
                  key={item.ticker}
                  className="flex items-center justify-between py-4 transition-colors"
                >
                  <span className="font-bold">{item.ticker}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">{item.price}</span>
                    <span className={`text-[10px] font-bold ${item.color}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <Button variant="outline" className="h-9 w-full text-xs">
                종목 추가하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
