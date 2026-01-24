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
import { useTranslation } from "react-i18next";

import { AnimatedGradientText } from "~/core/components/ui/animated-gradient-text";
import { AuroraText } from "~/core/components/ui/aurora-text";
import { Button } from "~/core/components/ui/button";
import { Marquee } from "~/core/components/ui/marquee";
import { NumberTicker } from "~/core/components/ui/number-ticker";
import { Progress } from "~/core/components/ui/progress";
import { TextAnimate } from "~/core/components/ui/text-animate";
import i18next from "~/core/lib/i18next.server";
import { cn } from "~/core/lib/utils";

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
export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.subtitle },
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
  // Get a translation function for the user's locale from the request
  const t = await i18next.getFixedT(request);

  // Return translated strings for use in both the component and meta function
  return {
    title: t("home.title"),
    subtitle: t("home.subtitle"),
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
export default function Home() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  // Get the translation function for the current locale
  const { t } = useTranslation();

  const reviews = [
    {
      name: "Jack",
      username: "@jack",
      body: "I've never seen anything like this before. It's amazing. I love it.",
      img: "https://avatar.vercel.sh/jack",
    },
    {
      name: "Jill",
      username: "@jill",
      body: "I don't know what to say. I'm speechless. This is amazing.",
      img: "https://avatar.vercel.sh/jill",
    },
    {
      name: "John",
      username: "@john",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/john",
    },
    {
      name: "Jane",
      username: "@jane",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/jane",
    },
    {
      name: "Jenny",
      username: "@jenny",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/jenny",
    },
    {
      name: "James",
      username: "@james",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/james",
    },
  ];

  const firstRow = reviews.slice(0, reviews.length / 2);
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
          "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
          // light styles
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          // dark styles
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <img
            className="rounded-full"
            width="32"
            height="32"
            alt=""
            src={img}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium dark:text-white/40">{username}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm">{body}</blockquote>
      </figure>
    );
  };

  return (
    <>
      {/* 히어로 섹션 */}
      <section className="flex h-[calc(100vh-300px)] flex-col justify-between pt-0 pb-4">
        <div className="flex flex-1 items-center pt-8">
          <div className="grid w-full grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
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

              <div>
                <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl">
                  <AuroraText>리치루틴</AuroraText>
                </h1>
                <h2 className="text-muted-foreground mt-3 text-xl">
                  상위 1% 자본가의 루틴은 아침부터 시작됩니다.
                  <br />
                  미국/국내 주식부터 부동산까지, AI가 요약한 뉴스를 쉽게
                  만나보세요.
                </h2>
              </div>
              <div className="mt-2">
                <Button size="lg" className="px-8 py-5 text-lg font-semibold">
                  무료로 시작하기
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex w-full max-w-sm flex-col gap-3">
                <span className="text-center text-3xl font-semibold tracking-tight">
                  2026년 회원수 목표
                </span>
                <Progress value={progress} className="relative h-7 shadow-sm">
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1">
                    <div>
                      <NumberTicker
                        value={500}
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
                        value={50}
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
                  <span>목표 1,000명</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 로고 섹션 */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-4">
          {[
            "/naver-logo.svg",
            "/Yahoo!_Finance_logo.svg",
            "/naver-logo.svg",
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
        </div>
      </section>

      {/* 기능 섹션 */}

      <div className="mt-40 mb-20 w-3/4">
        <span className="text-[54px] font-bold tracking-tighter">
          AI가 설계한 루틴 AI가 설계한 루틴 AI가 설계한 루틴 AI가 설계한 루틴
          AI가 설계한 루틴 AI가 설계한 루틴
        </span>
      </div>

      <div className="mt-52 flex flex-col gap-6">
        <div className="grid grid-cols-3">
          <div className="col-span-1 flex flex-col justify-center">
            <h2 className="text-[42px] font-semibold tracking-tight">제목</h2>
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-muted-foreground"
            >
              내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용
            </TextAnimate>
          </div>
          <div className="col-span-2 flex items-center justify-end pl-10">
            <img
              src="/routine-lifestyle.png"
              alt="Routine Lifestyle"
              className="border-border/40 aspect-[736/750] w-full max-w-[736px] rounded-[2rem] border object-cover"
            />
          </div>
        </div>
        <div className="grid grid-cols-3">
          <div className="col-span-1 flex flex-col justify-center">
            <h2 className="text-[42px] font-semibold tracking-tight">제목</h2>
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-muted-foreground"
            >
              내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용
            </TextAnimate>
          </div>
          <div className="col-span-2 flex items-center justify-end pl-10">
            <img
              src="/routine-lifestyle.png"
              alt="Routine Lifestyle"
              className="border-border/40 aspect-[736/750] w-full max-w-[736px] rounded-[2rem] border object-cover"
            />
          </div>
        </div>
        <div className="grid grid-cols-3">
          <div className="col-span-1 flex flex-col justify-center">
            <h2 className="text-[42px] font-semibold tracking-tight">제목</h2>
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-muted-foreground"
            >
              내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용
            </TextAnimate>
          </div>
          <div className="col-span-2 flex items-center justify-end pl-10">
            <img
              src="/routine-lifestyle.png"
              alt="Routine Lifestyle"
              className="border-border/40 aspect-[736/750] w-full max-w-[736px] rounded-[2rem] border object-cover"
            />
          </div>
        </div>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee className="[--duration:20s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </div>
      </div>
    </>
  );
}
