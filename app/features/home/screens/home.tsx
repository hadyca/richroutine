/**
 * Home Page Component
 *
 * This file implements the main landing page of the application with internationalization support.
 * It demonstrates the use of i18next for multi-language content, React Router's data API for
 * server-side rendering, and responsive design with Tailwind CSS.
 *
 * Key features:
 * - Server-side translation with i18next
 * - Client-side translation with useTranslation hook
 * - SEO-friendly metadata using React Router's meta export
 * - Responsive typography with Tailwind CSS
 */
import type { Route } from "./+types/home";

import { useEffect, useState } from "react";

import { AnimatedGradientText } from "~/core/components/ui/animated-gradient-text";
import { AuroraText } from "~/core/components/ui/aurora-text";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import { Marquee } from "~/core/components/ui/marquee";
import { NumberTicker } from "~/core/components/ui/number-ticker";
import { Progress } from "~/core/components/ui/progress";
import { TextAnimate } from "~/core/components/ui/text-animate";
import { TypingAnimation } from "~/core/components/ui/typing-animation";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";
import { getTotalUserCount } from "~/features/users/queries";

import { PricingSection } from "../components/pricing-section";

const REVIEWS = [
  {
    name: "이개토",
    username: "스튜디오 사업가",
    body: "워렌 버핏은 매일 아침 경제 신문을 본다고 합니다.\n저같은 경우 경제에 무지해 어디서 어떻게 시작해야 할지 몰라 속는셈치고 구독하기 시작하였는데, 경제 전반에 대한 내용들이 알기 쉽게 잘 정리되어 있네요.\n특히나 보유중인 종목 등록 후 내 종목에 미치는 영향까지 알려주니 심적으로 안정이 됩니다! \n리치루틴 가즈아~",
    img: "/lee.jpg",
  },
  {
    name: "KB PARK",
    username: "전업 트레이더",
    body: "RichRoutine is highly practical as it allows me to instantly check news directly related to the stocks I invest in. It significantly reduces the time spent on information analysis by filtering only the issues that impact my portfolio from the vast sea of economic news. \nMoreover, by providing the context of issues alongside investment perspectives, it helps minimize unnecessary emotional judgment. I highly recommend this service for its positive impact on making more stable and rational investment decisions.",
    img: "/PARK.jpg",
  },
];

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-fit w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img
          className="size-8 rounded-full object-cover select-none"
          alt=""
          src={img}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm whitespace-pre-wrap">
        {body}
      </blockquote>
    </figure>
  );
};

/**
 * Meta function for setting page metadata
 *
 * This function generates SEO-friendly metadata for the home page using data from the loader.
 * It sets:
 * - Page title from translated "home.title" key
 * - Meta description from translated "home.subtitle" key
 *
 * The metadata is language-specific based on the user's locale preference.
 *
 * @param data - Data returned from the loader function containing translated title and subtitle
 * @returns Array of metadata objects for the page
 */
export const meta: Route.MetaFunction = () => {
  return [
    { title: "리치루틴" },
    {
      name: "description",
      content:
        "AI가 요약한 국내 및 미국 증시 뉴스를 매일 아침 받아보세요. VIX, VKOSPI 등 시장 변동성 지표와 맞춤형 투자 인사이트를 한눈에 확인하세요.",
    },
  ];
};

/**
 * Loader function for server-side data fetching
 *
 * This function is executed on the server before rendering the component.
 * It:
 * 1. Extracts the user's locale from the request (via cookies or Accept-Language header)
 * 2. Creates a translation function for that specific locale
 * 3. Returns translated strings for the page title and subtitle
 *
 * This approach ensures that even on first load, users see content in their preferred language,
 * which improves both user experience and SEO (search engines see localized content).
 *
 * @param request - The incoming HTTP request containing locale information
 * @returns Object with translated title and subtitle strings
 */
export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const totalUsers = await getTotalUserCount(client);
  return {
    totalUsers,
  };
}

/**
 * Home page component
 *
 * This is the main landing page component of the application. It displays a simple,
 * centered layout with a headline and subtitle, both internationalized using i18next.
 *
 * Features:
 * - Uses the useTranslation hook for client-side translation
 * - Implements responsive design with Tailwind CSS
 * - Maintains consistent translations between server and client
 *
 * The component is intentionally simple to serve as a starting point for customization.
 * It demonstrates the core patterns used throughout the application:
 * - Internationalization
 * - Responsive design
 * - Clean, semantic HTML structure
 *
 * @returns JSX element representing the home page
 */
export default function Home({ loaderData }: Route.ComponentProps) {
  const [progress, setProgress] = useState(0);
  const TARGET_USERS = 1000;
  const progressPercentage = Math.ceil(
    (loaderData.totalUsers / TARGET_USERS) * 100,
  );

  useEffect(() => {
    const timer = setTimeout(() => setProgress(progressPercentage), 500);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  return (
    <>
      {/* 히어로 섹션 */}
      <section className="flex min-h-[calc(100vh-300px)] flex-col justify-between">
        <div className="flex items-center justify-center">
          <div className="grid w-full grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
            <div className="flex flex-col items-center gap-8 text-center md:items-start md:text-left">
              <div className="group relative flex w-fit items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                <span
                  className={cn(
                    "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]",
                  )}
                  style={{
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "destination-out",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "subtract",
                    WebkitClipPath: "padding-box",
                  }}
                />
                🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
                <AnimatedGradientText className="text-sm font-medium">
                  2026 Beta
                </AnimatedGradientText>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-7xl">
                  <AuroraText>리치루틴</AuroraText>
                </h1>
                <h2 className="text-muted-foreground mt-3 text-lg tracking-tight md:text-xl">
                  상위 1% 투자자의 루틴은 아침부터 시작됩니다.
                  <br />
                  매일 아침 3분 투자로, 당신의 포트폴리오가 달라집니다.
                </h2>
              </div>
            </div>
            <Card className="flex items-center justify-center p-6 md:p-0">
              <div className="flex flex-col items-center justify-center">
                <div className="flex w-full max-w-sm flex-col gap-4">
                  <span className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
                    2026년 회원수 목표
                  </span>
                  <div className="flex flex-col gap-2">
                    <Progress
                      value={progress}
                      className="relative h-7 shadow-sm"
                    >
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1">
                        <div>
                          <NumberTicker
                            value={loaderData.totalUsers}
                            className="text-primary-foreground font-bold"
                            delay={0.5}
                          />
                          <span className="text-primary-foreground text-sm font-bold">
                            명
                          </span>
                        </div>
                        <div>
                          <span className="text-primary-foreground text-sm font-bold">
                            (
                          </span>
                          <NumberTicker
                            value={progressPercentage}
                            className="text-primary-foreground text-sm font-bold"
                            delay={0.5}
                          />
                          <span className="text-primary-foreground text-sm font-bold">
                            %
                          </span>
                          <span className="text-primary-foreground text-sm font-bold">
                            )
                          </span>
                        </div>
                      </div>
                    </Progress>
                    <div className="flex w-full items-center justify-between px-1 text-sm font-medium">
                      <span>0명</span>
                      <span>목표 {TARGET_USERS.toLocaleString()}명</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="mt-12 flex justify-center md:mt-0">
          <Button
            size="lg"
            className="h-14 px-8 text-lg font-semibold md:h-16 md:px-10 md:text-xl"
            onClick={() => {
              document
                .getElementById("pricing")
                ?.scrollIntoView({ behavior: "instant" });
            }}
          >
            리치루틴 합류하기
          </Button>
        </div>
        {/* 로고 섹션 */}
        {/* <div className="mt-20 flex flex-wrap items-center justify-center gap-8 md:mt-0 md:gap-32">
          {[
            "/naver-logo.svg",
            "/Yahoo!_Finance_logo.svg",
            "/KB_Signature_row_kr_1.png",
            "/Yahoo!_Finance_logo.svg",
            "/naver-logo.svg",
          ].map((logo, idx) => (
            <img
              key={idx}
              src={logo}
              alt="brand-logo"
              className="h-6 w-auto opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:opacity-30 dark:invert dark:hover:opacity-100 dark:hover:brightness-0 dark:hover:invert"
            />
          ))}
        </div> */}
      </section>

      {/* 기능 섹션 */}
      <div className="mt-24 w-full md:mt-40 md:w-3/4">
        <TypingAnimation
          startOnView
          words={[
            "복잡한 주식 시장, 리치루틴은 당신의 투자에 꼭 필요한 시그널만 짚어냅니다.",
          ]}
          typeSpeed={50}
          className="text-3xl font-bold tracking-tighter md:text-[52px]"
        />
      </div>

      <div className="mt-32 flex flex-col gap-12 md:mt-52 md:gap-24">
        {/* 첫 번째 기능 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-1 flex flex-col justify-center text-center md:text-left">
            <h2 className="text-3xl font-semibold tracking-tight md:text-[42px]">
              시장 심리 지표를 한눈에
            </h2>
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-muted-foreground mt-4"
              viewport={{ amount: 0.8 }}
            >
              매일 시장 심리 지표를 확인하고, 감정이 아닌 객관적인 데이터로 최적의 매수·매도
              타이밍을 잡아보세요.
            </TextAnimate>
          </div>
          <div className="col-span-1 flex items-center justify-center md:col-span-2 md:justify-end md:pl-10">
            <img
              src="/light-index.png"
              alt="Index"
              className="aspect-[3104/1423] w-full max-w-[736px] rounded-2xl object-contain md:rounded-[2rem] dark:hidden"
              style={{ imageRendering: "crisp-edges" }}
            />
            <img
              src="/dark-index.png"
              alt="Index"
              className="hidden aspect-[3104/1423] w-full max-w-[736px] rounded-2xl object-contain md:rounded-[2rem] dark:block"
              style={{ imageRendering: "crisp-edges" }}
            />
          </div>
        </div>

        {/* 세 번째 기능 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-1 flex flex-col justify-center text-center md:text-left">
            <h2 className="text-3xl font-semibold tracking-tight md:text-[42px]">
              소음은 제거, 신호만 전달
            </h2>
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-muted-foreground mt-4"
              viewport={{ amount: 0.8 }}
            >
              매일 수백 건의 뉴스 속에서 AI가 투자 가치가 있는 상위 5개 핵심
              이슈를 추출합니다. 시간은 아끼고, 인사이트는 더 깊게.
            </TextAnimate>
          </div>
          <div className="col-span-1 flex items-center justify-center md:col-span-2 md:justify-end md:pl-10">
            <img
              src="/light-daily-news.png"
              alt="Daily News"
              className="aspect-[4928/2036] w-full max-w-[736px] rounded-2xl object-contain md:rounded-[2rem] dark:hidden"
              style={{ imageRendering: "crisp-edges" }}
            />
            <img
              src="/dark-daily-news.png"
              alt="Daily News"
              className="hidden aspect-[4940/2064] w-full max-w-[736px] rounded-2xl object-contain md:rounded-[2rem] dark:block"
              style={{ imageRendering: "crisp-edges" }}
            />
          </div>
        </div>

        {/* 네 번째 기능 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-1 flex flex-col justify-center text-center md:text-left">
            <h2 className="text-3xl font-semibold tracking-tight md:text-[42px]">
              내 종목에 미치는 영향까지
            </h2>
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-muted-foreground mt-4"
              viewport={{ amount: 0.8 }}
            >
              같은 뉴스도 보유 종목에 따라 의미가 다릅니다. AI가 당신의 관심
              종목 기준으로 뉴스를 재해석하여, 진짜 필요한 정보만 전달합니다.
            </TextAnimate>
          </div>
          <div className="col-span-1 flex items-center justify-center md:col-span-2 md:justify-end md:pl-10">
            <img
              src="/light-daily-news-2.png"
              alt="Daily News 2"
              className="aspect-[4952/1920] w-full max-w-[736px] rounded-2xl object-contain md:rounded-[2rem] dark:hidden"
              style={{ imageRendering: "crisp-edges" }}
            />
            <img
              src="/dark-daily-news-2.png"
              alt="Daily News 2"
              className="hidden aspect-[4928/1904] w-full max-w-[736px] rounded-2xl object-contain md:rounded-[2rem] dark:block"
              style={{ imageRendering: "crisp-edges" }}
            />
          </div>
        </div>
        {/* todo : 리뷰 섹션은 향 후 추가 예정 */}
        {/* <div className="relative mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee className="items-start [--duration:20s]">
            {REVIEWS.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </div> */}
        {/* 가격비교 섹션 */}
        <PricingSection />
      </div>
    </>
  );
}
