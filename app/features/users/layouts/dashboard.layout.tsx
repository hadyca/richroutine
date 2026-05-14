import type { Route } from "./+types/dashboard.layout";

import { DateTime } from "luxon";
import { Outlet } from "react-router";

import { Marquee } from "~/core/components/ui/marquee";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/core/components/ui/sidebar";
import { requireAuthentication } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";
import { getMarketIndices } from "~/features/news/queries";
import { getUserSubscription } from "~/features/payments/queries";
import { getLoggedInUserId } from "~/features/users/queries";

import DashboardSidebar from "../components/dashboard-sidebar";

const MarketCard = ({
  symbol,
  name,
  price,
  changePercent,
}: {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}) => {
  const isUp = changePercent >= 0;
  return (
    <a
      href={`https://finance.yahoo.com/quote/${symbol}`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-background/50 hover:bg-accent/50 flex cursor-pointer items-center gap-3 rounded-xl border px-6 py-2 shadow-sm transition-colors"
    >
      <div className="flex flex-col">
        <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          {symbol}
        </span>
        <span className="max-w-[80px] truncate text-sm font-bold">{name}</span>
      </div>
      <div className="flex min-w-[70px] flex-col items-end">
        <span className="font-mono text-sm font-bold">
          {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
        <span
          className={cn(
            "flex items-center gap-0.5 text-[11px] font-bold",
            isUp ? "text-red-500" : "text-blue-500",
          )}
        >
          {isUp ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
        </span>
      </div>
    </a>
  );
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAuthentication(client);

  const userId = await getLoggedInUserId(client);
  const subscription = await getUserSubscription(client, { userId });

  const {
    data: { user },
  } = await client.auth.getUser();

  const marketData = await getMarketIndices(client);

  return {
    user,
    subscriptionType: subscription?.subscription_type ?? "FREE",
    subscriptionEndDate: subscription?.expires_at,
    marketData: marketData.map((d) => ({
      symbol: d.symbol,
      name: d.name,
      price: d.price,
      changePercent: d.change_percent,
      updatedAt: d.updated_at,
    })),
  };
}

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
  const { user, marketData } = loaderData;

  return (
    <SidebarProvider>
      <DashboardSidebar
        user={{
          name: user?.user_metadata.name ?? "",
          avatarUrl: user?.user_metadata.avatar_url ?? "",
          email: user?.email ?? "",
        }}
        subscriptionType={loaderData.subscriptionType}
      />
      <SidebarInset>
        <header className="relative flex h-20 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
          <div className="absolute top-0 left-0 flex h-full items-center px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-12 lg:px-10">
            <Marquee className="gap-4" pauseOnHover>
              {marketData.map((data) => (
                <MarketCard key={data.symbol} {...data} />
              ))}
            </Marquee>
            {marketData.length > 0 && (
              <div className="mt-1 flex items-center gap-1.5">
                <div className="bg-primary h-1 w-1 animate-pulse rounded-full" />
                <span className="text-foreground font-mono text-[9px] font-bold uppercase">
                  지표 업데이트 :{" "}
                  {DateTime.fromISO(marketData[0].updatedAt, { zone: "utc" })
                    .setZone("Asia/Seoul")
                    .toFormat("yyyy.MM.dd HH:mm:ss")}
                </span>
              </div>
            )}
          </div>
        </header>

        <Outlet
          context={{
            subscriptionType: loaderData.subscriptionType,
            subscriptionEndDate: loaderData.subscriptionEndDate,
            exchangeRate: marketData.find((idx: any) => idx?.symbol === "KRW=X")
              ?.price,
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
