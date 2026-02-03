import type { Route } from "./+types/dashboard";

import axios from "axios";
import {
  Activity,
  ArrowUpRight,
  Bell,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Separator } from "~/core/components/ui/separator";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Command Center | ${import.meta.env.VITE_APP_NAME}` }];
};

export default function Dashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-primary flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">
              Control Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Main Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            투자 자산 현황과 실시간 시장 지능을 한눈에 확인하세요.
          </p>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Hero Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "VIX (Fear Index)",
            value: "15.42",
            change: "+1.24%",
            icon: Activity,
            trend: "up",
          },
          {
            label: "VKOSPI",
            value: "18.25",
            change: "-0.45%",
            icon: Activity,
            trend: "down",
          },
          {
            label: "KB 매수우위지표",
            value: "32.8",
            change: "+2.1",
            icon: LineChart,
            trend: "up",
          },
          {
            label: "구독 등급",
            value: "PRO",
            change: "Active",
            icon: ShieldCheck,
            trend: "neutral",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none bg-slate-50 shadow-none dark:bg-slate-900/40"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                {stat.label}
              </span>
              <stat.icon className="text-primary h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold ${
                    stat.label.includes("VIX") || stat.label.includes("VKOSPI")
                      ? stat.trend === "up"
                        ? "text-red-500" // Risk rising
                        : stat.trend === "down"
                          ? "text-emerald-500" // Risk falling
                          : "text-primary"
                      : stat.trend === "up"
                        ? "text-emerald-500"
                        : stat.trend === "down"
                          ? "text-red-500"
                          : "text-primary"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground text-[10px] font-medium underline underline-offset-2">
                  {stat.label.includes("VIX") ? "Real-time" : "vs yesterday"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Intelligence Card */}
        <Card className="border-primary/10 from-background to-primary/5 bg-gradient-to-br lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />
                Latest Market Intelligence
              </CardTitle>
            </div>
            <CardDescription>
              AI가 분석한 실시간 핵심 시장 변동 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "VIX Summary",
                  content:
                    "시장 변동성이 소폭 상승 중이나 여전히 안정권이며, 극단적 공포는 감지되지 않습니다.",
                  color: "bg-blue-500",
                },
                {
                  label: "VKOSPI Summary",
                  content:
                    "국내 변동성 지수는 하향 안정화 추세로, 코스피 시장의 하방 경직성이 강화되고 있습니다.",
                  color: "bg-indigo-500",
                },
                {
                  label: "KB 지표 Summary",
                  content:
                    "매수 세력이 점진적으로 유입되며 시장 심리가 위축 구간에서 점진적으로 벗어나고 있습니다.",
                  color: "bg-emerald-500",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                    <span className="text-[10px] font-bold tracking-tight text-slate-500 uppercase">
                      {item.label}
                    </span>
                  </div>
                  <p className="border-l-2 border-slate-100 pl-3 text-sm leading-relaxed font-medium select-none dark:border-slate-800">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Watchlist */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">My Watchlist</CardTitle>
            <CardDescription>
              오늘의 뉴스에 반영되는 종목입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-border/50 divide-y">
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
                  className="hover:bg-muted/30 flex cursor-pointer items-center justify-between px-6 py-4 transition-colors"
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
