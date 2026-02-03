import type { Route } from "./+types/today-news";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  LayoutList,
  MessageSquareQuote,
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
  return [{ title: `Intelligence Report | ${import.meta.env.VITE_APP_NAME}` }];
};

export default function TodayNews() {
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50/50 dark:bg-slate-950/50">
      <div className="mx-auto w-full max-w-5xl space-y-10 p-6 lg:p-12">
        {/* Report Header */}
        <div className="flex flex-col gap-6 border-b pb-10">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/5 rounded-full px-3 py-1 text-xs leading-none font-bold tracking-widest uppercase"
            >
              Daily Strategic Report
            </Badge>
            <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>최종 업데이트: 08:45 KST</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl leading-[1.1] font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
              연준 의장 지명 여파와 <br />
              <span className="text-primary italic">빅테크 실적의 갈림길</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed">
              매파적 성향의 차기 연준 의장 지명으로 시장 금리가 요동치고
              있습니다. 기술주 실적 발표를 앞둔 변동성 구간에서의 대응 전략을
              제시합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full border border-slate-200 px-4 shadow-sm dark:border-slate-800"
            >
              <FileText className="h-4 w-4" /> 요약 리포트 PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full border border-slate-200 px-4 shadow-sm dark:border-slate-800"
            >
              <Zap className="h-4 w-4" /> AI 빠른 브리핑
            </Button>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="space-y-4">
              <h2 className="text-primary flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                <LayoutList className="h-4 w-4" /> Executive Summary
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  오늘의 시장은 <strong>'워시 쇼크'</strong>와{" "}
                  <strong>'실적 차별화'</strong> 두 단어로 요약됩니다. 케빈
                  워시의 매파적 행보는 금리 인하 기대감을 후퇴시키며 달러 강세를
                  촉발했습니다. 하지만 이와 대조적으로 메타와 같은 빅테크들의
                  견조한 가이던스는 하방 압력을 방어하고 있습니다.
                </p>
                <div className="mt-6 space-y-3 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <AlertCircle className="h-4 w-4 text-amber-500" /> 오늘의
                    전략적 핵심
                  </h4>
                  <ul className="marker:text-primary space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      금리 상방 압력에 따른 나스닥 기술적 조정 가능성 대비
                      (지지선 25,200pt)
                    </li>
                    <li>
                      알파벳 실적 발표 전 현금 비중 15~20% 확보로 탄력적 대응
                      준비
                    </li>
                    <li>
                      강달러 환경에서의 수출 주도주 및 가상자산 변동성 리스크
                      관리
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Tactical Timeline */}
            <section className="space-y-6 pt-4">
              <h2 className="text-primary flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                <Layers className="h-4 w-4" /> Tactical Intelligence
              </h2>

              <div className="before:from-primary/50 relative space-y-12 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:via-slate-200 before:to-transparent">
                {[
                  {
                    title: "연준의 매파적 선회 (Kevin Warsh Impact)",
                    time: "Market Open",
                    desc: "양적완화 비판론자의 지명은 긴축 우려를 재점화했습니다. 국채 금리 급등은 기술주 멀티플에 직접적인 타격을 주고 있습니다.",
                    sentiment: "negative",
                  },
                  {
                    title: "S&P 500 마의 7,000선 공방",
                    time: "+2 Hours",
                    desc: "역사적 고점 돌파 이후의 차익 실현 매물이 쏟아지고 있습니다. 특히 AI 인프라 관련주에서의 수급 이탈이 눈에 띕니다.",
                    sentiment: "neutral",
                  },
                  {
                    title: "인플레이션 스티키(Sticky) 현상 확인",
                    time: "+4 Hours",
                    desc: "12월 PPI 상회는 상반기 금리 동결 가능성을 높였습니다. 에너지 가격 반등이 서비스 물가 하락을 상쇄 중입니다.",
                    sentiment: "negative",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="relative flex items-start gap-8 pl-12"
                  >
                    <div className="border-primary absolute left-0 z-10 mt-1.5 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white shadow-sm dark:bg-slate-900">
                      {item.sentiment === "negative" ? (
                        <ArrowDownRight className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-primary text-xs font-bold uppercase">
                          {item.time}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] opacity-70"
                        >
                          CONFIRMED
                        </Badge>
                      </div>
                      <h3 className="group-hover:text-primary cursor-default text-xl font-bold text-slate-900 transition-colors dark:text-white">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-slate-600 italic dark:text-slate-400">
                        "{item.desc}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Side Performance / Impact Info */}
          <div className="space-y-6">
            <Card className="sticky top-8 overflow-hidden border-none bg-white shadow-xl shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none">
              <div className="bg-primary/5 border-b p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChartImpactIcon className="h-4 w-4" /> Asset Exposure
                  Impact
                </CardTitle>
              </div>
              <CardContent className="space-y-5 p-4">
                <div className="space-y-4">
                  {[
                    {
                      label: "NASDAQ 100",
                      impact: "높음",
                      trend: "down",
                      value: "-1.45%",
                    },
                    {
                      label: "달러 인덱스",
                      impact: "중상",
                      trend: "up",
                      value: "+0.32%",
                    },
                    {
                      label: "미 국채 10년물",
                      impact: "심각",
                      trend: "up",
                      value: "4.82%",
                    },
                    {
                      label: "가상자산",
                      impact: "높음",
                      trend: "down",
                      value: "-3.12%",
                    },
                  ].map((asset, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {asset.label}
                        </span>
                        <span className="text-muted-foreground text-[10px] uppercase">
                          분석 강도: {asset.impact}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-black ${asset.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {asset.value}
                        </div>
                        <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full ${asset.trend === "up" ? "bg-emerald-500" : "bg-red-500"}`}
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <h4 className="text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase">
                    <MessageSquareQuote className="h-3 w-3" /> Expert Consensus
                  </h4>
                  <p className="text-sm leading-snug font-medium">
                    "실적 호조가 금리 우려를 상쇄하지 못하는 구간. 밸류에이션
                    재평가가 불가피하므로 우량주 중심의 압축 대응을 권고함."
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white">
                      RR
                    </div>
                    <span className="decoration-primary/30 text-xs font-bold text-slate-500 underline underline-offset-4">
                      RichRoutine AI Analyst
                    </span>
                  </div>
                </div>

                <Button className="shadow-primary/20 w-full rounded-xl py-6 font-bold shadow-lg transition-all hover:scale-[1.02]">
                  상세 1:1 맞춤 진단 받기
                </Button>
              </CardContent>
            </Card>

            <div className="bg-primary text-primary-foreground space-y-4 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-5 w-5" /> Today's Action Plan
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm opacity-90">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white" />
                  <span>QQQ 매달림 구간 탈출 확인 전까지 보수적 대기</span>
                </div>
                <div className="flex items-start gap-2 text-sm opacity-90">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white" />
                  <span>NVDA 실적 코멘트 중 'CAPEX' 단어에 집중</span>
                </div>
                <div className="flex items-start gap-2 border-t border-white/20 pt-2 text-sm font-bold opacity-90">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white" />
                  <span>전체 포트폴리오 베타 노출도 0.8 이하로 하향</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-muted-foreground flex flex-col justify-between gap-4 border-t pt-10 text-[11px] md:flex-row md:items-center">
          <p>© 2026 RichRoutine Intelligence Unit. All rights reserved.</p>
          <div className="flex gap-4 underline decoration-slate-200 underline-offset-4">
            <span>Data Privacy</span>
            <span>Terms of Service</span>
            <span>Financial Advice Notice</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom simple icon component
function BarChartImpactIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
