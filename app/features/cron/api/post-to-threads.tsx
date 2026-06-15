import type { Route } from "./+types/post-to-threads";

import * as Sentry from "@sentry/react-router";
import { data } from "react-router";

import adminClient from "~/core/lib/supa-admin-client.server";
import { postTextToThreads } from "~/core/lib/economy-service.server";
import { getEconomyNewsByCategory } from "~/features/news/queries";

export const action = async ({ request }: Route.ActionArgs) => {
  // 1. 요청 보안 검증 (CRON_SECRET 검사)
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  try {
    // 2. DB에서 오늘의 미국 주식 경제 뉴스 Top 5 획득
    const newsList = await getEconomyNewsByCategory(adminClient, "US_STOCK");

    if (!newsList || newsList.length === 0) {
      console.log("⚠️ Threads 자동 포스팅 보류: DB에 오늘 미국 주식 뉴스가 없습니다.");
      return Response.json({
        success: true,
        message: "포스팅할 미국 주식 뉴스가 존재하지 않습니다.",
      });
    }

    // 3. Threads 포스트 내용 빌드 (500자 이내 준수)
    let postText = "🇺🇸 오늘의 주요 미국 주식 뉴스 🇺🇸\n\n";

    newsList.slice(0, 5).forEach((item, index) => {
      const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][index] || "▪️";
      postText += `${emoji} ${item.headline}\n`;
    });

    postText += "\n더 자세한 뉴스 요약과 포트폴리오 관리는 리치루틴 앱에서 확인하세요! 🚀\n";
    postText += "#리치루틴 #미국주식 #경제뉴스 #주식투자";

    // 4. Threads API로 글 작성 수행
    const postId = await postTextToThreads(postText);

    return Response.json({
      success: true,
      postId: postId,
      postedText: postText,
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
