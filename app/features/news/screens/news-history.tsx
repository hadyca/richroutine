import type { Route } from "./+types/news-history";

import {
  Calendar,
  ChevronRight,
  Download,
  Filter,
  History,
  Search,
  Star,
  TrendingUp,
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
import { Input } from "~/core/components/ui/input";
import { Separator } from "~/core/components/ui/separator";

export const meta: Route.MetaFunction = () => {
  return [{ title: `News History | ${import.meta.env.VITE_APP_NAME}` }];
};

const MOCK_HISTORY = [
  {
    id: 1,
    date: "2026-02-01",
    title: "뉴욕 증시, 고용 지표 호조에 상승세 지속",
    summary:
      "비농업 고용자 수가 예상치를 웃돌며 연착륙 기대감이 확산되었습니다...",
    accuracy: 94,
    tags: ["미국증시", "고용"],
    isFavorite: true,
  },
  {
    id: 2,
    date: "2026-01-31",
    title: "국내 반도체 섹터, 실적 발표 후 기관 매수세 유입",
    summary:
      "삼성전자와 SK하이닉스의 긍정적 가이던스 발표 이후 소부장 종목들이...",
    accuracy: 88,
    tags: ["K-증시", "반도체"],
    isFavorite: false,
  },
  {
    id: 3,
    date: "2026-01-30",
    title: "유럽 물가 지표 하락, 금리 인하 속도 탄력 받나",
    summary:
      "유로존 인플레이션이 예상보다 빠르게 둔화되며 ECB의 3월 금리 인하 가능성이...",
    accuracy: 91,
    tags: ["거시경제", "유럽"],
    isFavorite: false,
  },
  {
    id: 4,
    date: "2026-01-29",
    title: "중국 부양책 발표, 중화권 증시 V자 반등 성공",
    summary:
      "중국 인민은행의 지준율 인하 소식에 홍콩 항셍 지수가 4% 넘게 급등하며...",
    accuracy: 76,
    tags: ["중국", "부양책"],
    isFavorite: true,
  },
];

export default function NewsHistory() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-primary flex items-center gap-2">
            <History className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">
              Archives
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">News History</h1>
          <p className="text-muted-foreground text-sm">
            지난 브리핑 기록을 검색하고 다시 읽어보세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" /> 내보내기
          </Button>
          <Button size="sm" className="h-9">
            프리미엄 리포트 신청
          </Button>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="제목, 키워드, 날짜 검색..."
            className="bg-muted/30 focus-visible:ring-primary border-none pl-10 focus-visible:ring-1"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="border-input h-10 w-10 border md:h-10 md:w-auto md:px-3"
        >
          <Filter className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">필터링</span>
        </Button>
      </div>

      {/* Stats Summary Tooltip-like Area */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "총 읽은 뉴스",
            value: "128건",
            icon: History,
            color: "text-blue-500",
          },
          {
            label: "AI 예측 정확도",
            value: "89.4%",
            icon: TrendingUp,
            color: "text-emerald-500",
          },
          {
            label: "즐겨찾기",
            value: "12건",
            icon: Star,
            color: "text-amber-500",
          },
          {
            label: "참여 기간",
            value: "48일",
            icon: Calendar,
            color: "text-purple-500",
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-muted/40 border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
              <span className="text-muted-foreground text-xs font-medium">
                {stat.label}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="text-muted-foreground h-5 w-5" />
          최근 히스토리
        </h2>

        <div className="grid gap-3">
          {MOCK_HISTORY.map((item) => (
            <Card
              key={item.id}
              className="group border-border/50 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/30"
            >
              <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                <div className="text-muted-foreground w-24 flex-shrink-0 text-sm font-medium">
                  {item.date}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="group-hover:text-primary font-semibold transition-colors">
                      {item.title}
                    </h3>
                    {item.isFavorite && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-1 text-sm">
                    {item.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-muted/50 h-5 text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 border-t pt-2 md:justify-end md:border-none md:pt-0">
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground text-[10px] font-bold uppercase">
                      Accuracy
                    </span>
                    <span
                      className={`text-sm font-bold ${item.accuracy > 90 ? "text-emerald-500" : "text-amber-500"}`}
                    >
                      {item.accuracy}%
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group-hover:bg-primary group-hover:text-primary-foreground rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          className="text-muted-foreground hover:text-primary hover:border-primary h-12 w-full border-dashed transition-all"
        >
          과거 데이터 더 불러오기
        </Button>
      </div>
    </div>
  );
}
