/**
 * Server-Side Internationalization (i18n) Configuration Module
 *
 * This module configures the internationalization system specifically for server-side
 * rendering in the application. Unlike the regular i18next.ts module which uses file system
 * backend, this module uses in-memory resources for translations, which is more efficient
 * for server-side rendering.
 *
 * The configuration includes:
 * - Cookie-based language preference storage with proper security settings
 * - Support for multiple languages (English, Spanish, Korean)
 * - In-memory translation resources for each supported language
 * - Integration with Remix for server-side rendering
 *
 * This module is critical for ensuring that the application can render content in
 * the user's preferred language on the server before sending it to the client.
 *
 * 서버 측 국제화(i18n) 설정 모듈
 *
 * 이 모듈은 애플리케이션의 서버 측 렌더링을 위한 국제화 시스템을 설정합니다.
 * 파일 시스템 백엔드를 사용하는 일반적인 i18next.ts 모듈과 달리,
 * 이 모듈은 서버 측 렌더링에 더 효율적인 인메모리 리소스를 사용합니다.
 *
 * 주요 설정:
 * - 보안 설정이 적용된 쿠키 기반 언어 설정 저장
 * - 다국어 지원 (영어, 스페인어, 한국어)
 * - 각 언어별 인메모리 번역 리소스
 * - Remix 프레임워크와의 서버 측 렌더링 통합
 *
 * 이 모듈은 서버에서 사용자 언어 설정에 맞춰 콘텐츠를 미리 렌더링하여
 * 클라이언트에 전달하는 핵심적인 역할을 합니다.
 */
import resourcesToBackend from "i18next-resources-to-backend";
import { createCookie } from "react-router";
import { RemixI18Next } from "remix-i18next/server";

// Import the base i18n configuration
import i18n from "~/i18n";
// Import translation resources for each supported language
import en from "~/locales/en";
import es from "~/locales/es";
import ko from "~/locales/ko";

/**
 * Cookie for storing the user's language preference
 *
 * This cookie is used to persist the user's language choice across sessions.
 * Unlike the cookie in i18next.ts, this one includes security settings:
 * - path: "/" - Makes the cookie available across the entire application
 * - sameSite: "lax" - Provides some CSRF protection while allowing normal navigation
 */
export const localeCookie = createCookie("locale", {
  path: "/",
  sameSite: "lax",
  secrets: [process.env.COOKIE_SECRET!],
});

/**
 * RemixI18Next instance configured for server-side rendering
 *
 * This configuration sets up:
 * 1. Language detection strategy (cookie)
 * 2. Supported languages from the base i18n configuration
 * 3. Fallback language when the requested language is not available
 * 4. In-memory resources for translations (more efficient for server-side rendering)
 *
 * The instance is used in loaders to determine the user's language preference
 * and load the appropriate translations for server-rendered content.
 */
const i18next = new RemixI18Next({
  // Language detection configuration
  detection: {
    // Use the localeCookie for persistent language preference
    cookie: localeCookie,
    // Languages supported by the application
    supportedLanguages: i18n.supportedLngs as unknown as string[],
    // Fallback language when the requested language is not available
    fallbackLanguage: i18n.fallbackLng,
  },
  // i18next configuration
  i18next: {
    // Spread the base i18n configuration
    ...i18n,
    // In-memory translation resources for each supported language
    resources: {
      // English translations
      en: {
        common: en,
      },
      // Spanish translations
      es: {
        common: es,
      },
      // Korean translations
      ko: {
        common: ko,
      },
    },
  },
});

export default i18next;
