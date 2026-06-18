import type { Route } from "./+types/post-to-threads";

import * as Sentry from "@sentry/react-router";
import { data } from "react-router";

import {
  postReplyToThreads,
  postTextToThreads,
} from "~/core/lib/economy-service.server";
import adminClient from "~/core/lib/supa-admin-client.server";
import {
  getEconomyNewsByCategory,
  getLatestEconomyIndices,
} from "~/features/news/queries";

export const action = async ({ request }: Route.ActionArgs) => {
  // 1. 요청 보안 검증 (CRON_SECRET 검사)
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    // 2. DB에서 미국/국내 주식 경제 뉴스 + 경제 지수 동시 획득
    const [newsList, krNewsList, economyIndices] = await Promise.all([
      getEconomyNewsByCategory(adminClient, "US_STOCK"),
      getEconomyNewsByCategory(adminClient, "KR_STOCK"),
      getLatestEconomyIndices(adminClient),
    ]);

    if (!newsList || newsList.length === 0) {
      console.log(
        "⚠️ Threads 자동 포스팅 보류: DB에 오늘 미국 주식 뉴스가 없습니다.",
      );
      return Response.json({
        success: true,
        message: "포스팅할 미국 주식 뉴스가 존재하지 않습니다.",
      });
    }

    // 3. CNN 공포&탐욕 지수, VIX 최신 값 추출
    const getLatestByTicker = (ticker: string) => {
      const items = economyIndices
        .filter((idx) => idx.ticker === ticker)
        .sort((a, b) => b.base_date.localeCompare(a.base_date));
      return items[0] || null;
    };

    const cnnFg = getLatestByTicker("CNN_FG");
    const vix = getLatestByTicker("VIX");

    const getCnnFgSentiment = (val: number) => {
      if (val <= 24) return "극도의 공포 😱";
      if (val <= 44) return "공포 😨";
      if (val <= 55) return "중립 😐";
      if (val <= 75) return "탐욕 🤑";
      return "극도의 탐욕 🚀";
    };

    const getVixSentiment = (val: number) => {
      if (val <= 20) return "낮은 변동성 😌";
      if (val <= 30) return "정상 😐";
      return "높은 변동성 😱";
    };

    const cnnValue = cnnFg ? Math.round(cnnFg.current_price) : "N/A";
    const cnnChange = cnnFg
      ? `${(cnnFg.change_percent ?? 0) >= 0 ? "+" : ""}${(cnnFg.change_percent ?? 0).toFixed(2)}%`
      : "";
    const cnnSentiment = cnnFg ? getCnnFgSentiment(cnnFg.current_price) : "";

    const vixValue = vix ? Math.round(vix.current_price) : "N/A";
    const vixChange = vix
      ? `${(vix.change_percent ?? 0) >= 0 ? "+" : ""}${(vix.change_percent ?? 0).toFixed(2)}%`
      : "";
    const vixSentiment = vix ? getVixSentiment(vix.current_price) : "";

    // 4. Threads 포스트 내용 빌드 (500자 이내 준수)
    const today = new Date();
    const dateStr = today.toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const postText = `[${dateStr}]
출근길 30초 컷, 오늘 아침 주식 시장 심리&뉴스 요약

• CNN 공포&탐욕 지수: ${cnnValue}(${cnnChange}) ${cnnSentiment}
• VIX (변동성 지수): ${vixValue}(${vixChange}) ${vixSentiment}

오늘 미/국내 증시 핵심 헤드라인 TOP 5는 아래로 👇`;

    // 5. Threads API로 글 작성 수행
    const postId = await postTextToThreads(postText);
    console.log("✅ 루트 포스트 ID:", postId);

    // 6. 첫 번째 댓글: 미국 증시 핵심 뉴스 TOP 5 (재시도 로직이 내부에 포함됨)
    let commentText = "🇺🇸 미국 증시 핵심 뉴스 top5\n\n";
    newsList.slice(0, 5).forEach((item, idx) => {
      commentText += `${idx + 1}. ${item.headline}\n`;
    });
    const commentId = await postReplyToThreads(commentText.trim(), postId);
    console.log("✅ 첫번째 댓글 ID:", commentId);

    // 7. 대댓글: 국내 증시 핵심 뉴스 TOP 5 + CTA (재시도 로직이 내부에 포함됨)
    let replyText = "🇰🇷 국내 증시 핵심 뉴스 top5\n\n";
    krNewsList.slice(0, 5).forEach((item, idx) => {
      replyText += `${idx + 1}. ${item.headline}\n`;
    });
    replyText += `\n🔍 오늘 뉴스, 내 계좌엔 어떤 영향을 줄까?\n내 보유 종목의 영향도와 AI 세부 분석이 궁금하다면?\n\n▶︎ 리치루틴에서 맞춤 브리핑 받기: https://richroutine.net`;
    const replyId = await postReplyToThreads(replyText.trim(), commentId);
    console.log("✅ 대댓글 ID:", replyId);

    return Response.json({
      success: true,
      postId: postId,
      commentId,
      replyId,
    });
  } catch (error) {
    console.error("❌ Threads 자동 포스팅 크론 작업 에러:", error);
    Sentry.captureException(error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
