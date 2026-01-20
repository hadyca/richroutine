/**
 * Theme Session Management Module
 *
 * This module configures and exports a theme session resolver for managing theme preferences
 * in the application. It integrates with remix-themes to provide server-side theme detection
 * and persistence through cookies.
 *
 * The theme preference is stored in a non-HTTP-only cookie, allowing both server and client
 * access to the theme setting. This enables the application to render with the correct theme
 * on initial load (server-side) and maintain theme consistency during client-side navigation.
 *
 * 테마 세션 관리 모듈
 *
 * 이 모듈은 애플리케이션의 테마 설정을 관리하기 위한 테마 세션 리졸버를 구성하고 내보냅니다.
 * remix-themes와 통합되어 쿠키를 통한 서버 사이드 테마 감지 및 유지를 제공합니다.
 *
 * 테마 설정은 HTTP-only가 아닌 쿠키에 저장되어 서버와 클라이언트 모두에서 테마 설정에 접근할 수 있습니다.
 * 이를 통해 애플리케이션은 초기 로드 시(서버 사이드) 올바른 테마로 렌더링될 수 있으며,
 * 클라이언트 사이드 탐색 중에도 테마 일관성을 유지할 수 있습니다.
 */
import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

/**
 * Cookie-based session storage for theme preferences
 *
 * This session storage is configured with the following settings:
 * - name: "theme" - The name of the cookie used to store theme preference
 * - path: "/" - Makes the cookie available across the entire application
 * - httpOnly: false - Allows JavaScript access to read the cookie (required for client-side theme switching)
 * - sameSite: "lax" - Provides some CSRF protection while allowing normal navigation
 *
 * Note: httpOnly is set to false intentionally to allow client-side theme detection
 * without requiring a server roundtrip. This is a common pattern for theme preferences
 * since they are not sensitive data.
 *
 * 테마 설정을 위한 쿠키 기반 세션 스토리지
 *
 * 이 세션 스토리지는 다음과 같은 설정으로 구성됩니다:
 * - name: "theme" - 테마 설정을 저장하는 데 사용되는 쿠키 이름
 * - path: "/" - 애플리케이션 전체에서 쿠키를 사용할 수 있도록 설정
 * - httpOnly: false - 자바스크립트에서 쿠키를 읽을 수 있도록 허용 (클라이언트 사이드 테마 전환에 필요)
 * - sameSite: "lax" - 일반적인 탐색을 허용하면서 어느 정도의 CSRF 보호 제공
 *
 * 참고: httpOnly는 서버 왕복 없이 클라이언트 사이드 테마 감지를 허용하기 위해 의도적으로 false로 설정되었습니다.
 * 테마 설정은 민감한 데이터가 아니므로 이는 일반적인 패턴입니다.
 */

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secrets: [process.env.COOKIE_SECRET!],
  },
});

/**
 * Theme session resolver for managing theme preferences
 *
 * This resolver provides methods for getting and setting the theme preference
 * in both server and client contexts. It's used by the ThemeProvider component
 * to initialize the theme and by theme switching components to update it.
 *
 * 테마 설정을 관리하기 위한 테마 세션 리졸버
 *
 * 이 리졸버는 서버와 클라이언트 컨텍스트 모두에서 테마 설정을 가져오고 설정하는 메서드를 제공합니다.
 * ThemeProvider 컴포넌트에서 테마를 초기화하고, 테마 전환 컴포넌트에서 테마를 업데이트하는 데 사용됩니다.
 *
 * @example
 * // In a loader function
 * export async function loader({ request }: LoaderArgs) {
 *   const { getTheme } = await themeSessionResolver(request);
 *   const theme = getTheme();
 *   return json({ theme });
 * }
 *
 * // In an action function for theme switching
 * export async function action({ request }: ActionArgs) {
 *   const { getTheme, setTheme } = await themeSessionResolver(request);
 *   const formData = await request.formData();
 *   const theme = formData.get("theme") as Theme;
 *   return json(
 *     { success: true },
 *     { headers: { "Set-Cookie": await setTheme(theme) } }
 *   );
 * }
 */
export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
