/**
 * Application Routes Configuration
 * 애플리케이션 라우트 설정
 *
 * This file defines all routes for the application using React Router's
 * file-based routing system. Routes are organized by feature and access level.
 * 이 파일은 React Router의 파일 기반 라우팅 시스템을 사용하여 애플리케이션의 모든 라우트를 정의합니다.
 * 라우트는 기능 및 액세스 수준에 따라 구성됩니다.
 *
 * The structure uses layouts for shared UI elements and prefixes for route grouping.
 * 이 구조는 공유 UI 요소를 위한 레이아웃과 라우트 그룹화를 위한 접두사(prefixes)를 사용합니다.
 *
 * This approach creates a hierarchical routing system that's both maintainable and scalable.
 * 이 방식은 유지보수가 용이하고 확장이 가능한 계층적 라우팅 시스템을 제공합니다.
 */
import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/robots.txt", "core/screens/robots.ts"),
  route("/sitemap.xml", "core/screens/sitemap.ts"),
  // API Routes. Routes that export actions and loaders but no UI.
  // API 라우트. 액션과 로더를 내보내지만 UI는 없는 라우트입니다.
  ...prefix("/api", [
    ...prefix("/settings", [
      route("/theme", "features/settings/api/set-theme.tsx"),
      route("/locale", "features/settings/api/set-locale.tsx"),
    ]),
    ...prefix("/users", [
      index("features/users/api/delete-account.tsx"),
      route("/email", "features/users/api/change-email.tsx"),
      route("/profile", "features/users/api/edit-profile.tsx"),
    ]),
    ...prefix("/cron", [
      route("/mailer", "features/cron/api/mailer.tsx"),
      route("/sync-nas-tickers", "features/cron/api/sync-nas-tickers.tsx"),
      route("/sync-nys-tickers", "features/cron/api/sync-nys-tickers.tsx"),
      route("/sync-ams-tickers", "features/cron/api/sync-ams-tickers.tsx"),
      route("/sync-kospi-tickers", "features/cron/api/sync-kospi-tickers.tsx"),
      route("/get-market-fear", "features/cron/api/get-market-fear.tsx"),
      route(
        "/sync-kosdaq-tickers",
        "features/cron/api/sync-kosdaq-tickers.tsx",
      ),
      route(
        "/update-watchlist-prices",
        "features/cron/api/update-watchlist-prices.tsx",
      ),
      route("/us-stock-news", "features/cron/api/us-stock-news.tsx"),
      route("/kr-stock-news", "features/cron/api/kr-stock-news.tsx"),
      route("/analyze-watchlist", "features/cron/api/analyze-watchlist.tsx"),

      route("/stock-opinion", "features/cron/api/stock-opinion.tsx"),
      route(
        "/update-market-indices",
        "features/cron/api/update-market-indices.tsx",
      ),
      route("/get-portfolio-news", "features/cron/api/get-portfolio-news.tsx"),
      route("/post-to-threads", "features/cron/api/post-to-threads.tsx"),
    ]),
    route("/news/search", "features/news/api/search-tickers.ts"),
  ]),

  layout("core/layouts/navigation.layout.tsx", [
    route("/auth/confirm", "features/auth/screens/confirm.tsx"),
    index("features/home/screens/home.tsx"),
    route("/error", "core/screens/error.tsx"),
    route("/login", "features/auth/screens/login.tsx"),
    route("/join", "features/auth/screens/join.tsx"),
    ...prefix("/auth", [
      route("/api/resend", "features/auth/api/resend.tsx"),
      route("/magic-link", "features/auth/screens/magic-link.tsx"),
      ...prefix("/social", [
        route("/start/:provider", "features/auth/screens/social/start.tsx"),
        route(
          "/complete/:provider",
          "features/auth/screens/social/complete.tsx",
        ),
      ]),
    ]),
    route("/logout", "features/auth/screens/logout.tsx"),
    ...prefix("/payments", [
      // route("/standard", "features/payments/screens/standard.tsx"),
      route("/pro", "features/payments/screens/pro.tsx"),
      // route("/success", "features/payments/screens/success.tsx"),
      // route("/failure", "features/payments/screens/failure.tsx"),
    ]),
  ]),
  // 로그인 필요
  layout("features/users/layouts/dashboard.layout.tsx", [
    ...prefix("/dashboard", [
      index("features/users/screens/dashboard.tsx"),
      layout("features/news/layouts/daily-news.layout.tsx", [
        route(
          "/news/us-stocks/:year/:month/:day",
          "features/news/screens/us-stocks.tsx",
        ),
        route(
          "/news/kr-stocks/:year/:month/:day",
          "features/news/screens/kr-stocks.tsx",
        ),
      ]),
      route("/news/:category", "features/news/screens/news-redirection.tsx"),
      route("/news-history", "features/news/screens/news-history.tsx"),
      route("/payments", "features/payments/screens/payments.tsx"),
    ]),
    route("/account/edit", "features/users/screens/account.tsx"),
  ]),

  ...prefix("/legal", [route("/:slug", "features/legal/screens/policy.tsx")]),
] satisfies RouteConfig;
