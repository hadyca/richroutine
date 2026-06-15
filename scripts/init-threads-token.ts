import axios from "axios";
import "dotenv/config";

import { exchangeAndSaveThreadsToken } from "~/core/lib/economy-service.server";

// .env 파일의 THREADS_SHORT_TOKEN 환경변수에서 단기 토큰을 읽어옵니다.
const SHORT_LIVED_TOKEN = process.env.THREADS_SHORT_TOKEN;

async function main() {
  // THREADS_SHORT_TOKEN 검증
  // const verify = await axios.get("https://graph.threads.net/v1.0/me", {
  //   params: {
  //     access_token: SHORT_LIVED_TOKEN,
  //     fields: "id,username",
  //   },
  // });
  // console.log(verify.data);
  if (!SHORT_LIVED_TOKEN || SHORT_LIVED_TOKEN === "YOUR_SHORT_TOKEN") {
    console.error(
      "❌ .env 파일에 THREADS_SHORT_TOKEN 값이 설정되지 않았거나 기본값입니다.\n" +
        "   .env 파일에 THREADS_SHORT_TOKEN=발급받은단기토큰을 추가해 주세요.",
    );
    process.exit(1);
  }

  // THREADS_APP_SECRET 검증
  if (!process.env.THREADS_APP_SECRET) {
    console.error(
      "❌ .env 파일에 THREADS_APP_SECRET 값이 설정되지 않았습니다.\n" +
        "   .env 파일에 THREADS_APP_SECRET=앱비밀번호 를 추가해 주세요.",
    );
    process.exit(1);
  }

  try {
    console.log(
      "🔄 Threads 단기 토큰 -> 장기 토큰(60일) 교환 및 DB 등록을 시작합니다...",
    );
    // await exchangeAndSaveThreadsToken(SHORT_LIVED_TOKEN);
    console.log("🎉 장기 토큰이 성공적으로 DB에 등록 및 캐싱되었습니다!");
  } catch (error) {
    console.error("❌ 토큰 초기화 등록 실패:", error);
  }
}

main().catch(console.error);
