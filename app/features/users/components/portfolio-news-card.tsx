import { PopoverTrigger } from "@radix-ui/react-popover";
import { CircleQuestionMark } from "lucide-react";

import { Badge } from "~/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
} from "~/core/components/ui/popover";
import { ScrollArea } from "~/core/components/ui/scroll-area";

interface NewsItem {
  id: string;
  ticker: string;
  title: string;
  timeAgo: string;
  url: string;
  source: string;
}

interface PortfolioNewsCardProps {
  news?: NewsItem[];
}

export function PortfolioNewsCard({ news = [] }: PortfolioNewsCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            보유 종목 관련 뉴스
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <CircleQuestionMark className="text-muted-foreground/50 hover:text-muted-foreground h-4 w-4 cursor-help transition-colors" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <PopoverDescription className="text-xs leading-relaxed whitespace-pre-line">
                보유 종목과 관련된 24시간 이내의 뉴스를 보여줍니다. (매일 오전
                7시경 최신 기사로 업데이트)
              </PopoverDescription>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-border divide-y px-6">
            {news.length > 0 ? (
              news.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:bg-muted/50 -mx-6 block px-6 py-4 transition-colors"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 py-0 text-[10px] font-bold"
                    >
                      {item.ticker}
                    </Badge>
                    <span className="text-muted-foreground text-[10px] font-medium">
                      {item.source} • {item.timeAgo}
                    </span>
                  </div>
                  <h4 className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold transition-colors">
                    {item.title}
                  </h4>
                </a>
              ))
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  표시할 뉴스가 없습니다.
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  종목을 추가하고 최신 뉴스를 받아보세요.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
