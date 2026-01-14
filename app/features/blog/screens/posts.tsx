/**
 * Blog Posts Screen
 *
 * This component displays a list of blog posts from MDX files in the docs directory.
 * It uses mdx-bundler to extract frontmatter from MDX files and renders a grid of
 * blog post cards with images, titles, descriptions, and metadata.
 *
 * The blog implementation demonstrates:
 * 1. MDX content handling with frontmatter extraction
 * 2. File system operations for reading blog content
 * 3. Responsive grid layout for different screen sizes
 * 4. View transitions for smooth navigation between pages
 *
 * 블로그 포스트 화면
 *
 * 이 컴포넌트는 docs 디렉토리의 MDX 파일에서 블로그 포스트 목록을 표시합니다.
 * mdx-bundler를 사용하여 MDX 파일에서 frontmatter를 추출하고 이미지, 제목, 설명 및 메타데이터가 포함된
 * 블로그 포스트 카드 그리드를 렌더링합니다.
 *
 * 블로그 구현은 다음을 보여줍니다:
 * 1. frontmatter 추출을 포함한 MDX 콘텐츠 처리
 * 2. 블로그 콘텐츠를 읽기 위한 파일 시스템 작업
 * 3. 다양한 화면 크기에 대응하는 반응형 그리드 레이아웃
 * 4. 페이지 간의 부드러운 이동을 위한 뷰 전환(View transitions)
 */
import type { Route } from "./+types/posts";

import { bundleMDX } from "mdx-bundler";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { Link } from "react-router";

import { Badge } from "~/core/components/ui/badge";

/**
 * Meta function for the blog posts page
 *
 * Sets the page title using the application name from environment variables
 * and adds a meta description for SEO purposes
 */
export const meta: Route.MetaFunction = () => {
  return [
    { title: `Supablog | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: "Follow our development journey!" },
  ];
};

/**
 * Interface defining the structure of MDX frontmatter
 *
 * Each MDX blog post file must include these metadata fields in its frontmatter:
 * - title: The title of the blog post
 * - description: A brief summary of the post content
 * - date: Publication date (used for sorting)
 * - category: The post category for filtering/grouping
 * - author: The name of the post author
 * - slug: URL-friendly identifier for the post
 */
interface Frontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
  author: string;
  slug: string;
}

/**
 * Loader function for the blog posts page
 *
 * This function reads all MDX files from the docs directory and extracts their frontmatter:
 * 1. Determines the path to the docs directory containing MDX blog posts
 * 2. Reads all files in the directory and filters for .mdx files
 * 3. Processes each MDX file to extract its frontmatter metadata
 * 4. Sorts the posts by date (newest first)
 * 5. Returns the frontmatter data to be used by the component
 *
 * @returns Object containing an array of blog post frontmatter data
 */
export async function loader() {
  // Get the path to the docs directory containing MDX files
  const docsPath = path.join(process.cwd(), "app", "features", "blog", "docs");

  // Read all files in the docs directory
  const files = await readdir(docsPath);

  // Filter for MDX files only
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

  // Extract frontmatter from each MDX file
  const frontmatters = await Promise.all(
    mdxFiles.map(async (file) => {
      const filePath = path.join(docsPath, file);
      const { frontmatter } = await bundleMDX({ file: filePath });
      return frontmatter;
    }),
  );

  // Sort posts by date, newest first
  frontmatters.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Return the frontmatter data
  return {
    frontmatters: frontmatters as Frontmatter[],
  };
}

/**
 * Blog Posts Component
 *
 * This component renders the blog posts page with a header and a grid of blog post cards.
 * Each card displays:
 * - Featured image (matching the post slug)
 * - Category badge
 * - Post title
 * - Post description
 * - Author and date information
 *
 * The component uses responsive design with different layouts for mobile and desktop:
 * - Single column on mobile devices
 * - Three-column grid on desktop devices
 *
 * It also implements view transitions for smooth navigation between the posts list
 * and individual post pages.
 *
 * 블로그 포스트 컴포넌트
 *
 * 이 컴포넌트는 헤더와 블로그 포스트 카드 그리드로 구성된 블로그 포스트 페이지를 렌더링합니다.
 * 각 카드는 다음 정보를 표시합니다:
 * - 대표 이미지 (포스트 슬러그와 일치)
 * - 카테고리 배지
 * - 포스트 제목
 * - 포스트 설명
 * - 작성자 및 날짜 정보
 *
 * 이 컴포넌트는 모바일과 데스크톱 환경에 따라 다른 레이아웃을 사용하는 반응형 디자인을 적용합니다:
 * - 모바일 기기: 단일 열 레이아웃
 * - 데스크톱 기기: 3열 그리드 레이아웃
 *
 * 또한 포스트 목록과 개별 포스트 페이지 간의 부드러운 이동을 위해 뷰 전환(view transitions)을 구현합니다.
 *
 * @param loaderData - Data from the loader containing blog post frontmatter
 * @param loaderData - 블로그 포스트 프론트매터 데이터를 포함하는 로더 데이터
 */

export default function Posts({
  loaderData: { frontmatters },
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-16">
      {/* Page header with title and subtitle */}
      <header className="flex flex-col items-center">
        <h1 className="text-center text-3xl font-semibold tracking-tight md:text-5xl">
          Blog
        </h1>
        <p className="text-muted-foreground mt-2 text-center font-medium md:text-lg">
          Follow our development journey!
        </p>
      </header>

      {/* Responsive grid of blog post cards */}
      <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
        {frontmatters.map((frontmatter) => (
          <Link
            to={`/blog/${frontmatter.slug}`}
            key={frontmatter.slug}
            className="flex flex-col gap-4"
            viewTransition // Enable smooth transitions between pages
          >
            {/* Post featured image */}
            <img
              src={`/blog/${frontmatter.slug}.jpg`}
              alt={frontmatter.title}
              className="aspect-square w-full rounded-xl object-cover object-center"
            />
            {/* Category badge */}
            <Badge variant="secondary" className="text-sm">
              {frontmatter.category}
            </Badge>
            <div>
              {/* Post title */}
              <h2 className="text-lg font-bold md:text-2xl">
                {frontmatter.title}
              </h2>
              {/* Post description */}
              <p className="text-muted-foreground text-pretty md:text-lg">
                {frontmatter.description}
              </p>
              {/* Author and date information */}
              <span className="text-muted-foreground mt-2 block text-sm">
                By {frontmatter.author} on{" "}
                {new Date(frontmatter.date).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
