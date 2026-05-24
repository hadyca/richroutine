import {
  Bell,
  CircleQuestionMark,
  Delete,
  Loader2Icon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useFetcher } from "react-router";
import { DateTime } from "luxon";
import { toast } from "sonner";

import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/core/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/core/components/ui/dropdown-menu";
import { Input } from "~/core/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "~/core/components/ui/popover";
import { RainbowButton } from "~/core/components/ui/rainbow-button";
import { ScrollArea, ScrollBar } from "~/core/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";

interface WatchlistCardProps {
  subscriptionType: string;
  watchlist: any[];
  exchangeRate: number;
}

export function WatchlistCard({
  subscriptionType,
  watchlist,
  exchangeRate,
}: WatchlistCardProps) {
  const searchFetcher = useFetcher<any[]>();
  const searchFetcherRef = useRef(searchFetcher);
  searchFetcherRef.current = searchFetcher;
  const actionFetcher = useFetcher();
  const isAdding =
    actionFetcher.state !== "idle" &&
    actionFetcher.formData?.get("intent") === "add";
  const togglingTicker =
    actionFetcher.state !== "idle" &&
    actionFetcher.formData?.get("intent") === "toggle_ai_news"
      ? (actionFetcher.formData?.get("ticker") as string)
      : null;
  const removingTicker =
    actionFetcher.state !== "idle" &&
    actionFetcher.formData?.get("intent") === "remove"
      ? (actionFetcher.formData?.get("ticker") as string)
      : null;

  const usStocks = watchlist.filter((item) => item.tickers?.market === "US");
  const krStocks = watchlist.filter((item) => item.tickers?.market === "KR");

  // Calculate overall totals
  const totalPurchaseValue = watchlist.reduce((acc, item) => {
    const val = (item.avg_price || 0) * (item.quantity || 0);
    const convertedVal =
      item.tickers?.market === "US" ? val * exchangeRate : val;
    return acc + convertedVal;
  }, 0);
  const totalCurrentValue = watchlist.reduce((acc, item) => {
    const val = (item.tickers?.last_price || 0) * (item.quantity || 0);
    const convertedVal =
      item.tickers?.market === "US" ? val * exchangeRate : val;
    return acc + convertedVal;
  }, 0);
  const totalProfitAmount = totalCurrentValue - totalPurchaseValue;
  const totalProfitPercent =
    totalPurchaseValue > 0 ? (totalProfitAmount / totalPurchaseValue) * 100 : 0;

  const representativeUpdatedAt = watchlist.find(
    (item) => item.tickers?.updated_at,
  )?.tickers?.updated_at;
  const formattedUpdatedAt = representativeUpdatedAt
    ? DateTime.fromISO(representativeUpdatedAt, { zone: "utc" })
        .setZone("Asia/Seoul")
        .toFormat("yyyy.MM.dd HH:mm")
    : null;

  const renderWatchlistItem = (item: any) => {
    const currentPrice = item.tickers?.last_price || 0;
    const purchaseValue = (item.avg_price || 0) * (item.quantity || 0);
    const currentValue = currentPrice * (item.quantity || 0);
    const profitAmount = currentValue - purchaseValue;
    const profitPercent =
      purchaseValue > 0 ? (profitAmount / purchaseValue) * 100 : 0;
    const breakEvenPercent =
      profitAmount < 0 && currentPrice > 0
        ? ((item.avg_price - currentPrice) / currentPrice) * 100
        : 0;

    return (
      <TableRow
        key={item.watchlist_id}
        className="group border-b transition-colors last:border-0"
      >
        <TableCell className="py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm leading-none">
              {item.tickers?.market === "US"
                ? item.ticker
                : item.tickers?.name_ko || item.tickers?.name_en}
            </span>
            <span className="text-[10px] font-medium tracking-wider">
              {item.quantity?.toLocaleString() || 0}주
            </span>
          </div>
        </TableCell>
        <TableCell className="py-3 text-right">
          <span className="text-sm tabular-nums">
            {item.tickers?.market === "US" ? "$" : "₩"}
            {(item.avg_price || 0).toLocaleString(undefined, {
              minimumFractionDigits: item.tickers?.market === "US" ? 2 : 0,
              maximumFractionDigits: item.tickers?.market === "US" ? 2 : 0,
            })}
          </span>
        </TableCell>
        <TableCell className="py-3 text-right">
          {item.tickers?.last_price ? (
            <span className="text-sm tabular-nums">
              {item.tickers.market === "US" ? "$" : "₩"}
              {item.tickers.last_price.toLocaleString(undefined, {
                minimumFractionDigits: item.tickers.market === "US" ? 2 : 0,
                maximumFractionDigits: item.tickers.market === "US" ? 2 : 0,
              })}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
              {item.tickers?.exchange}
            </span>
          )}
        </TableCell>
        <TableCell className="py-3 text-right">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm tabular-nums">
              {item.tickers?.market === "US" ? "$" : "₩"}
              {currentValue.toLocaleString(undefined, {
                minimumFractionDigits: item.tickers?.market === "US" ? 2 : 0,
                maximumFractionDigits: item.tickers?.market === "US" ? 2 : 0,
              })}
            </span>
            <span
              className={`text-[10px] font-medium tabular-nums ${
                profitAmount > 0
                  ? "text-red-500"
                  : profitAmount < 0
                    ? "text-blue-500"
                    : "text-muted-foreground"
              }`}
            >
              {profitAmount > 0 ? "+" : ""}
              {profitAmount.toLocaleString(undefined, {
                minimumFractionDigits: item.tickers?.market === "US" ? 2 : 0,
                maximumFractionDigits: item.tickers?.market === "US" ? 2 : 0,
              })}
              ({Math.abs(profitPercent).toFixed(2)}%)
            </span>
            {profitAmount < 0 && breakEvenPercent > 0 && (
              <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500 tabular-nums">
                본전까지 +{breakEvenPercent.toFixed(2)}%
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="w-10 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                className="text-sm"
                disabled={togglingTicker === item.ticker}
                onSelect={(e) => {
                  e.preventDefault();
                  actionFetcher.submit(
                    {
                      intent: "toggle_ai_news",
                      ticker: item.ticker,
                      checked: String(!item.is_ai_news_subscribed),
                    },
                    { method: "post" },
                  );
                }}
              >
                {togglingTicker === item.ticker ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-yellow-500" />
                ) : (
                  <Bell
                    className={`mr-2 h-4 w-4 ${
                      item.is_ai_news_subscribed
                        ? "fill-current text-yellow-500"
                        : "text-slate-400"
                    }`}
                  />
                )}
                {item.is_ai_news_subscribed
                  ? "AI 종목 분석 구독 취소"
                  : "AI 종목 분석 구독"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-sm"
                onSelect={() => {
                  setSelectedTicker(
                    item.tickers
                      ? { ...item.tickers, ticker: item.ticker }
                      : { ticker: item.ticker },
                  );
                  setQuantityValue(String(item.quantity ?? ""));
                  setPriceValue(String(item.avg_price ?? ""));
                  setEditingTicker(item.ticker);
                  setStep("detail");
                  setIsSearchOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-sm"
                variant="destructive"
                disabled={removingTicker === item.ticker}
                onSelect={(e) => {
                  e.preventDefault();
                  actionFetcher.submit(
                    { intent: "remove", ticker: item.ticker },
                    { method: "post" },
                  );
                }}
              >
                {removingTicker === item.ticker ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [step, setStep] = useState<"search" | "detail">("search");
  const [selectedTicker, setSelectedTicker] = useState<any>(null);
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<"quantity" | "price">(
    "quantity",
  );
  const [quantityValue, setQuantityValue] = useState("");
  const [priceValue, setPriceValue] = useState("");
  // 필드 활성화 직훈 첫 입력인지 추적 (첫 입력 시 기존 값 지우기)
  const isFirstInput = useRef(false);

  const handleKeypadPress = (val: string) => {
    const setFn = activeInput === "quantity" ? setQuantityValue : setPriceValue;

    setFn((prev) => {
      if (val === "back") {
        isFirstInput.current = false;
        return prev.slice(0, -1);
      } else if (val === ".") {
        if (isFirstInput.current) {
          isFirstInput.current = false;
          return "0.";
        }
        if (!prev.includes(".")) return prev + ".";
        return prev;
      } else {
        // 첫 입력 시 기존 값 완전 초기화
        if (isFirstInput.current) {
          isFirstInput.current = false;
          return val;
        }
        // 선행 0 방지: 현재 값이 "0"이면 0 추가 차단, 다른 숫자면 교체
        if (prev === "0") {
          if (val === "0") return prev;
          return val;
        }
        if (prev.length < 12) return prev + val;
        return prev;
      }
    });
  };

  useEffect(() => {
    if (!isSearchOpen || step !== "detail") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeypadPress(e.key);
      } else if (e.key === ".") {
        handleKeypadPress(".");
      } else if (e.key === "Backspace") {
        handleKeypadPress("back");
      } else if (e.key === "Tab") {
        e.preventDefault();
        isFirstInput.current = true;
        setActiveInput((prev) => (prev === "quantity" ? "price" : "quantity"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, step, activeInput]);

  const resetDialog = () => {
    setStep("search");
    setSelectedTicker(null);
    setEditingTicker(null);
    setQuantityValue("");
    setPriceValue("");
    setActiveInput("quantity");
    setSearchQuery("");
  };

  // 검색어 변경 시 디바운스를 적용하여 API 호출
  useEffect(() => {
    if (searchQuery.length < 2) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      searchFetcherRef.current.load(
        `/api/news/search?q=${encodeURIComponent(searchQuery)}`,
      );
      setIsTyping(false);
    }, 500); // 500ms 대기 후 호출

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [isPendingAction, setIsPendingAction] = useState(false);
  useEffect(() => {
    const intent = actionFetcher.formData?.get("intent");
    if (
      actionFetcher.state !== "idle" &&
      (intent === "add" || intent === "update")
    ) {
      setIsPendingAction(true);
    }
    if (isPendingAction && actionFetcher.state === "idle") {
      setIsPendingAction(false);
      if (actionFetcher.data && !(actionFetcher.data as any).error) {
        handleOpenChange(false);
      }
    }
  }, [actionFetcher.state, actionFetcher.data, isPendingAction]);

  useEffect(() => {
    const data = actionFetcher.data as any;
    if (
      actionFetcher.state === "idle" &&
      data?.error === "max_subscriptions" &&
      data?.intent === "toggle_ai_news"
    ) {
      toast.warning("AI 종목 분석 구독은 최대 3개까지만 가능합니다.", {
        duration: 4000,
      });
    }
  }, [actionFetcher.state, actionFetcher.data]);

  const handleOpenChange = (open: boolean) => {
    setIsSearchOpen(open);
    if (!open) {
      setTimeout(resetDialog, 200);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-baseline gap-2">
            <span>총 자산</span>
            {formattedUpdatedAt && (
              <span className="text-[11px] font-normal text-muted-foreground">
                ({formattedUpdatedAt} 기준)
              </span>
            )}
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <CircleQuestionMark className="text-muted-foreground/50 hover:text-muted-foreground h-4 w-4 cursor-help transition-colors" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <PopoverDescription className="text-xs leading-relaxed whitespace-pre-line">
                현재가는 1시간 간격으로 갱신되며, AI 분석 서비스는 최대 3개
                종목까지 지원합니다.
              </PopoverDescription>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xl font-bold">
              {Math.floor(totalCurrentValue).toLocaleString()}원
            </div>
            <div className="flex gap-1">
              <span
                className={`text-xs ${
                  totalProfitAmount > 0
                    ? "text-red-500"
                    : totalProfitAmount < 0
                      ? "text-blue-500"
                      : "text-muted-foreground"
                }`}
              >
                {totalProfitAmount > 0 ? "+" : ""}
                {Math.floor(totalProfitAmount).toLocaleString()}원
              </span>
              <span
                className={`text-xs ${
                  totalProfitAmount > 0
                    ? "text-red-500"
                    : totalProfitAmount < 0
                      ? "text-blue-500"
                      : "text-muted-foreground"
                }`}
              >
                ({Math.abs(totalProfitPercent).toFixed(2)}%)
              </span>
            </div>
          </div>
          <Dialog
            open={isSearchOpen}
            onOpenChange={(open) => {
              setIsSearchOpen(open);
              if (!open) {
                setTimeout(resetDialog, 200);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsSearchOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className={`top-[10%] translate-y-0 p-0 sm:max-w-md ${step === "detail" ? "bg-slate-50 dark:bg-slate-950" : ""}`}
              showCloseButton={step === "detail"}
            >
              {step === "search" ? (
                <>
                  <DialogHeader className="sr-only">
                    <DialogTitle>종목 검색</DialogTitle>
                    <DialogDescription>
                      추가할 관심 종목을 검색합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="border-b px-3 py-3">
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                      <Input
                        placeholder="미국, 한국 주식 검색"
                        className="h-10 border-0 pl-9 text-sm shadow-none focus-visible:ring-0"
                        value={searchQuery}
                        onChange={handleSearch}
                        autoFocus
                      />
                    </div>
                  </div>
                  <ScrollArea className="max-h-[360px] p-2">
                    {searchQuery.length < 2 ? (
                      <div className="text-muted-foreground py-12 text-center text-xs">
                        검색할 종목의 이름이나 티커를 2글자 이상 입력해주세요.
                      </div>
                    ) : isTyping || searchFetcher.state !== "idle" ? (
                      <div className="text-muted-foreground py-12 text-center text-xs">
                        <Loader2Icon className="mx-auto mb-2 h-4 w-4 animate-spin text-slate-400" />
                        결과를 불러오는 중입니다...
                      </div>
                    ) : searchFetcher.data &&
                      Array.isArray(searchFetcher.data) ? (
                      searchFetcher.data.length > 0 ? (
                        searchFetcher.data.map((ticker: any) => (
                          <div
                            key={ticker.ticker}
                            className="group flex cursor-pointer items-center justify-between rounded-md p-3 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                            onClick={() => {
                              setSelectedTicker(ticker);
                              setStep("detail");
                            }}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-foreground text-sm tracking-tight transition-colors">
                                {ticker.name_ko || ticker.name_en}
                              </span>
                              <span className="text-muted-foreground text-xs font-medium transition-colors">
                                {ticker.ticker}
                              </span>
                            </div>
                            <span className="text-muted-foreground text-xs font-medium transition-colors">
                              {ticker.market === "US"
                                ? "미국주식"
                                : ticker.market === "KR"
                                  ? "한국주식"
                                  : ticker.market || ticker.exchange}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground py-12 text-center text-xs">
                          검색 결과가 없습니다.
                        </div>
                      )
                    ) : (
                      <div className="text-muted-foreground py-12 text-center text-xs">
                        <Loader2Icon className="mx-auto mb-2 h-4 w-4 animate-spin text-slate-400" />
                        결과를 불러오는 중입니다...
                      </div>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <div className="flex flex-col">
                  {/* Ticker Info Header */}
                  <div className="bg-white p-6 pb-4 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold">
                          {selectedTicker?.name_ko || selectedTicker?.name_en}
                        </span>
                        <span className="text-muted-foreground text-sm font-medium">
                          {selectedTicker?.ticker} ·{" "}
                          {selectedTicker?.market === "US" ? "NASDAQ" : "KOSPI"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input Displays */}
                  <div className="grid grid-cols-2 gap-4 px-6 py-2">
                    <div
                      className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                        activeInput === "quantity"
                          ? "border-primary bg-primary/5 dark:bg-primary/20 ring-primary/20 shadow-sm ring-1"
                          : "border-transparent bg-white dark:bg-slate-900"
                      }`}
                      onClick={() => {
                        isFirstInput.current = true;
                        setActiveInput("quantity");
                      }}
                    >
                      <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                        보유 수량
                      </span>
                      <div className="flex items-baseline justify-end gap-1 overflow-hidden">
                        <span className="truncate text-lg font-bold tabular-nums">
                          {quantityValue || "0"}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          주
                        </span>
                      </div>
                    </div>

                    <div
                      className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                        activeInput === "price"
                          ? "border-primary bg-primary/5 dark:bg-primary/20 ring-primary/20 shadow-sm ring-1"
                          : "border-transparent bg-white dark:bg-slate-900"
                      }`}
                      onClick={() => {
                        isFirstInput.current = true;
                        setActiveInput("price");
                      }}
                    >
                      <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                        평균 매수가
                      </span>
                      <div className="flex items-baseline justify-end gap-1 overflow-hidden">
                        <span className="text-xs font-medium text-slate-400">
                          {selectedTicker?.market === "US" ? "$" : "₩"}
                        </span>
                        <span className="truncate text-lg font-bold tabular-nums">
                          {priceValue || "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calculator Keypad */}
                  <div className="grid grid-cols-3 gap-1 p-4 pb-6">
                    {[
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      ".",
                      "0",
                      "back",
                    ].map((key) => (
                      <Button
                        key={key}
                        variant="ghost"
                        className="h-14 text-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-800"
                        onClick={() => handleKeypadPress(key)}
                      >
                        {key === "back" ? <Delete className="size-5" /> : key}
                      </Button>
                    ))}
                  </div>

                  {/* Footer Action */}
                  <div className="p-6 pt-0">
                    <Button
                      className="w-full py-6 text-base font-bold shadow-lg"
                      disabled={
                        isAdding ||
                        !quantityValue ||
                        !priceValue ||
                        parseFloat(quantityValue) === 0 ||
                        parseFloat(priceValue) === 0
                      }
                      onClick={() => {
                        if (editingTicker) {
                          actionFetcher.submit(
                            {
                              intent: "update",
                              ticker: editingTicker,
                              quantity: quantityValue || "0",
                              avg_price: priceValue || "0",
                            },
                            { method: "post" },
                          );
                        } else {
                          actionFetcher.submit(
                            {
                              intent: "add",
                              ticker: selectedTicker.ticker,
                              quantity: quantityValue || "0",
                              avg_price: priceValue || "0",
                            },
                            { method: "post" },
                          );
                        }
                      }}
                    >
                      {actionFetcher.state !== "idle" &&
                      (editingTicker
                        ? actionFetcher.formData?.get("intent") === "update"
                        : isAdding) ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          {editingTicker ? "수정 중..." : "추가 중..."}
                        </>
                      ) : editingTicker ? (
                        "수정 완료"
                      ) : (
                        "종목 추가"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px] px-6">
          {subscriptionType !== "pro" ? (
            <div className="flex h-[220px] flex-col items-center justify-center pb-6 text-center">
              <p className="text-muted-foreground text-sm font-medium">
                관심 종목 설정은 구독자 전용 기능입니다.
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                PRO로 업그레이드하여 나만의 관심 종목을 추가해 보세요.
              </p>
              <RainbowButton asChild className="mt-4">
                <Link to="/payments/pro">PRO 구독하기</Link>
              </RainbowButton>
            </div>
          ) : (
            <div className="min-w-[520px]">
              {usStocks.length > 0 && (
                <>
                  <div className="text-muted-foreground p-2 text-sm font-bold">
                    미국 주식
                  </div>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-10 w-[40%] py-2">
                          종목
                        </TableHead>
                        <TableHead className="h-10 w-[18%] py-2 text-right">
                          평단가
                        </TableHead>
                        <TableHead className="h-10 w-[18%] py-2 text-right">
                          현재가
                        </TableHead>
                        <TableHead className="h-10 w-[18%] py-2 text-right">
                          자산가치
                        </TableHead>
                        <TableHead className="h-10 w-10 py-2 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="border-0">
                      {usStocks.map(renderWatchlistItem)}
                    </TableBody>
                  </Table>
                </>
              )}

              {krStocks.length > 0 && (
                <>
                  <div className="text-muted-foreground p-2 pt-5 text-sm font-bold">
                    한국 주식
                  </div>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-10 w-[40%] py-2">
                          종목
                        </TableHead>
                        <TableHead className="h-10 w-[18%] py-2 text-right">
                          평단가
                        </TableHead>
                        <TableHead className="h-10 w-[18%] py-2 text-right">
                          현재가
                        </TableHead>
                        <TableHead className="h-10 w-[18%] py-2 text-right">
                          자산가치
                        </TableHead>
                        <TableHead className="h-10 w-10 py-2 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="border-0">
                      {krStocks.map(renderWatchlistItem)}
                    </TableBody>
                  </Table>
                </>
              )}

              {watchlist.length === 0 && !isAdding && (
                <div className="flex h-[280px] items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    종목을 추가해주세요.
                  </p>
                </div>
              )}
            </div>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
