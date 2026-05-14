import { CircleQuestionMark } from "lucide-react";
import { DateTime } from "luxon";
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/core/components/ui/chart";
import { NumberTicker } from "~/core/components/ui/number-ticker";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "~/core/components/ui/popover";
import { cn } from "~/core/lib/utils";

interface StatCardProps {
  ticker: string;
  label: string;
  description: string;
  value?: any[];
}

export function StatCard({
  ticker,
  label,
  description,
  value = [],
}: StatCardProps) {
  const chartData = value.map((item: any) => ({
    date: DateTime.fromISO(item.base_date).toFormat("MM/dd"),
    value: Math.round(item.current_price),
  }));

  const latestValue = Math.round(
    value.length > 0 ? value[value.length - 1].current_price : 0,
  );
  const latestChangePercent =
    value.length > 0 ? value[value.length - 1].change_percent : 0;
  const isUp = latestChangePercent >= 0;

  const getSentimentEmoji = (val: number) => {
    if (ticker === "CNN_FG") {
      if (val <= 24) return "극도의 공포 😱";
      if (val <= 44) return "공포 😨";
      if (val <= 55) return "중립 😐";
      if (val <= 75) return "탐욕 🤑";
      return "극도의 탐욕 🚀";
    }

    if (ticker === "VIX") {
      if (val <= 20) return "낮은 변동성 😌";
      if (val <= 30) return "정상 😐";
      return "높은 변동성 😱";
    }

    return "";
  };

  const getSentimentDescription = (val: number) => {
    if (ticker === "CNN_FG") {
      if (val <= 24)
        return "시장이 패닉에 빠진 과매도 구간입니다. 장기적 관점에서 분할 매수를 검토해볼 수 있는 시점입니다.";
      if (val <= 44)
        return "투자자들이 불안을 느끼며 매도세가 우세한 단계입니다.";
      if (val <= 55)
        return "방향성 없이 관망세가 유지되는 중립적인 상태입니다.";
      if (val <= 75)
        return "투자 심리가 살아나며 매수세가 붙기 시작하는 단계입니다.";
      return "시장이 과열되어 거품이 낄 가능성이 높습니다. 수익 실현이나 리스크 관리에 유의해야 할 구간입니다.";
    }

    if (ticker === "VIX") {
      if (val <= 20) return "변동성이 낮고 시장이 매우 안정적인 상태입니다.";
      if (val <= 30)
        return "정상적인 변동성 범위 내에 있으나 관망이 필요합니다.";
      return "시장 불확실성이 크고 투자자들의 불안 심리가 고조된 상태입니다.";
    }
    return "";
  };

  const isCnnFg = ticker === "CNN_FG";

  const tickerConfig = isCnnFg
    ? {
        domain: [0, 100] as [number, number],
        leftTicks: [12.5, 35, 50, 65, 87.5],
        leftFormatter: (value: number) => {
          if (value === 12.5) return "극도의 공포";
          if (value === 35) return "공포";
          if (value === 50) return "중립";
          if (value === 65) return "탐욕";
          if (value === 87.5) return "극도의 탐욕";
          return "";
        },
        rightTicks: [0, 25, 50, 75, 100],
        referenceLines: [24, 44, 55, 75],
      }
    : {
        domain: [0, 60] as [number, number],
        leftTicks: [10, 25, 45],
        leftFormatter: (value: number) => {
          if (value === 10) return "낮음";
          if (value === 25) return "보통";
          if (value === 45) return "높음";
          return "";
        },
        rightTicks: [0, 10, 20, 30, 40, 50, 60],
        referenceLines: [20, 30],
      };

  const chartConfig = {
    value: {
      label: "지수",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex w-full flex-col gap-1">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>{label}</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <CircleQuestionMark className="text-muted-foreground/50 hover:text-muted-foreground h-4 w-4 cursor-help transition-colors" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <PopoverDescription className="text-xs leading-relaxed whitespace-pre-line">
                  {description}
                </PopoverDescription>
              </PopoverContent>
            </Popover>
          </div>
          <div className="mt-2 flex items-center">
            <span className="flex items-center text-2xl font-bold tracking-tight">
              <NumberTicker value={latestValue} decimalPlaces={0} />
            </span>
            <span
              className={cn(
                "flex items-center text-xs font-bold",
                isUp ? "text-red-500" : "text-blue-500",
              )}
            >
              ({isUp ? " +" : " -"} {Math.abs(latestChangePercent).toFixed(2)}%
              )
            </span>
            <span className="ml-1 text-2xl font-bold tracking-tight">
              {getSentimentEmoji(latestValue)}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              {getSentimentDescription(latestValue)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 0,
              bottom: 10,
              left: 0,
            }}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              padding={{ left: 5, right: 5 }}
              className="fill-muted-foreground text-[10px]"
            />
            <YAxis
              yAxisId="left"
              domain={tickerConfig.domain}
              ticks={tickerConfig.leftTicks}
              orientation="left"
              tickLine={false}
              axisLine={false}
              width={50}
              className="fill-muted-foreground text-[9px] font-bold whitespace-nowrap"
              tickFormatter={tickerConfig.leftFormatter}
            />
            <YAxis
              yAxisId="right"
              domain={tickerConfig.domain}
              ticks={tickerConfig.rightTicks}
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={50}
              tick={{ textAnchor: "start", dx: 5 }}
              className="fill-muted-foreground text-[9px] font-medium"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {tickerConfig.referenceLines.map((y) => (
              <ReferenceLine
                key={y}
                yAxisId="left"
                y={y}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            ))}
            <Area
              yAxisId="left"
              dataKey="value"
              type="natural"
              fill="var(--color-value)"
              fillOpacity={0.4}
              stroke="var(--color-value)"
            />
            <Area
              yAxisId="right"
              dataKey="value"
              tooltipType="none"
              type="natural"
              fill="transparent"
              stroke="transparent"
              fillOpacity={0}
              strokeWidth={0}
              activeDot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
