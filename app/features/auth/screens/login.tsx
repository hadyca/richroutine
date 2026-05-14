/**
 * Login Screen Component
 *
 * This component handles user authentication via email/password login,
 * social authentication providers, and provides options for password reset
 * and email verification. It demonstrates form validation, error handling,
 * and Supabase authentication integration.
 */
import type { Route } from "./+types/login";

import { AlertCircle, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, Link, data, useFetcher } from "react-router";
import Turnstile, { useTurnstile } from "react-turnstile";
import { z } from "zod";

import FormButton from "~/core/components/form-button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/core/components/ui/alert";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import makeServerClient from "~/core/lib/supa-client.server";
import { isTurnstileTokenValid } from "~/core/lib/turnstile.server";

import FormErrors from "../../../core/components/form-error";
import { SignInButtons } from "../components/auth-login-buttons";
import { doesUserExist } from "../lib/queries.server";

/**
 * Meta function for the login page
 *
 * Sets the page title using the application name from environment variables
 */
export const meta: Route.MetaFunction = () => {
  return [
    {
      title: `Log in | ${import.meta.env.VITE_APP_NAME}`,
    },
  ];
};

/**
 * Form validation schema for login
 *
 * Uses Zod to validate:
 * - Email: Must be a valid email format
 *
 * Error messages are provided for user feedback
 */
const loginSchema = z.object({
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  turnstile: z.string().min(1),
});

/**
 * Server action for handling login form submission
 *
 * This function processes the login form data and attempts to authenticate the user.
 * The flow is:
 * 1. Parse and validate form data using the login schema
 * 2. Return validation errors if the data is invalid
 * 3. Attempt to sign in with Supabase using email/password
 * 4. Return authentication errors if sign-in fails
 * 5. Redirect to home page with auth cookies if successful
 *
 * @param request - The form submission request
 * @returns Validation errors, auth errors, or redirect on success
 */
export async function action({ request }: Route.ActionArgs) {
  // Parse form data from the request
  const formData = await request.formData();
  const {
    data: validData,
    success,
    error,
  } = loginSchema.safeParse(Object.fromEntries(formData));

  // Return validation errors if form data is invalid
  if (!success) {
    return data({ fieldErrors: error.flatten().fieldErrors }, { status: 400 });
  }

  const validTurnstile = await isTurnstileTokenValid(validData.turnstile);

  if (!validTurnstile) {
    return data(
      {
        errors: {
          turnstile: !validTurnstile
            ? ["캡차가 유효하지 않습니다. 다시 시도해 주세요."]
            : [],
        },
        success: false,
      },
      { status: 400 },
    );
  }

  const userExists = await doesUserExist(validData.email);

  if (!userExists) {
    return data(
      { error: "등록되지 않은 계정입니다. 회원가입 후 이용해 주세요." },
      { status: 400 },
    );
  }

  // Create Supabase client with request cookies for authentication
  const [client] = makeServerClient(request);

  // Attempt to sign in with email and password
  // emailRedirectTo를 현재 요청의 origin으로 지정하여 dev/prod 환경 모두 대응
  const origin = new URL(request.url).origin;
  const { error: signInError } = await client.auth.signInWithOtp({
    email: validData.email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  // Return error if authentication fails
  if (signInError) {
    return data({ error: signInError.message }, { status: 400 });
  }
  return {
    success: true,
  };
}

/**
 * Login Component
 *
 * This component renders the login form and handles user interactions.
 * It includes:
 * - Email and password input fields with validation
 * - Error display for form validation and authentication errors
 * - Password reset link
 * - Email verification resend functionality
 * - Social login options
 * - Sign up link for new users
 *
 * @param actionData - Data returned from the form action, including any errors
 */
export default function Login({ actionData }: Route.ComponentProps) {
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [renderCaptchas, setRenderCaptchas] = useState<boolean>(false);
  const turnstile = useTurnstile(); // Hook for Turnstile widget interactions

  // Reference to the form element for accessing form data
  const formRef = useRef<HTMLFormElement>(null);

  // Handle form submission results: reset captcha, reset form on success, or show captcha on error
  useEffect(() => {
    if (!actionData) return;

    // Reset Turnstile token as it can only be used once
    turnstile.reset();
    setTurnstileToken("");

    // Handle successful login
    if ("success" in actionData && actionData.success) {
      formRef.current?.reset();
      formRef.current?.blur();
    }
    // Ensure CAPTCHA is visible if there are validation errors
    else if ("fieldErrors" in actionData || "errors" in actionData) {
      setRenderCaptchas(true);
    }
  }, [actionData]);

  // Fetcher for submitting the email verification resend request
  const fetcher = useFetcher();

  /**
   * Handler for resending email verification
   *
   * When a user tries to log in with an unverified email, they can click
   * to resend the verification email. This function:
   * 1. Prevents the default button behavior
   * 2. Gets the current form data (email only)
   * 3. Submits it to the resend endpoint
   */
  const onResendClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    fetcher.submit(formData, {
      method: "post",
      action: "/auth/api/resend",
    });
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold">로그인</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form
            className="flex w-full flex-col gap-5"
            method="post"
            ref={formRef}
            onChange={() => !renderCaptchas && setRenderCaptchas(true)}
          >
            <div className="flex flex-col items-start space-y-2">
              <Label
                htmlFor="email"
                className="flex flex-col items-start gap-1"
              >
                이메일
              </Label>
              <Input
                id="email"
                name="email"
                required
                type="email"
                placeholder="example@email.com"
              />
              {actionData &&
              "fieldErrors" in actionData &&
              actionData.fieldErrors.email ? (
                <FormErrors errors={actionData.fieldErrors.email} />
              ) : null}
            </div>

            <input
              type="hidden"
              name="turnstile"
              value={turnstileToken}
              required
            />

            {/* CAPTCHA widgets - only rendered when user interacts with form or there are errors */}
            {renderCaptchas ? (
              <div className="flex w-full justify-center">
                <div className="flex flex-col items-center">
                  <Turnstile
                    sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onVerify={(token) => {
                      setTurnstileToken(token);
                    }}
                  />
                  {actionData &&
                  "errors" in actionData &&
                  actionData.errors?.turnstile ? (
                    <FormErrors
                      key="turnstile"
                      errors={actionData.errors.turnstile}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            <FormButton
              label="Log in"
              className="w-full"
              disabled={!turnstileToken}
            />
            {/* ... error messages ... */}
            {actionData && "error" in actionData ? (
              actionData.error === "Email not confirmed" ? (
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Email not confirmed</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-2">
                    로그인하기 전에 이메일을 인증해 주세요.
                    <Button
                      variant="outline"
                      className="text-foreground flex items-center justify-between gap-2"
                      onClick={onResendClick}
                    >
                      확인 이메일 재발송
                      {fetcher.state === "submitting" ? (
                        <Loader2Icon
                          data-testid="resend-confirmation-email-spinner"
                          className="size-4 animate-spin"
                        />
                      ) : null}
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <FormErrors errors={[actionData.error]} />
              )
            ) : null}
            {actionData && "success" in actionData && actionData.success ? (
              <Alert className="bg-green-600/20 text-green-700 dark:bg-green-950/20 dark:text-green-600">
                <CheckCircle2Icon
                  className="size-4"
                  color="oklch(0.627 0.194 149.214)"
                />
                <AlertTitle>로그인 메일이 발송되었습니다!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-600">
                  이메일을 확인하여 로그인 링크를 클릭해주세요. 인증이 완료되면
                  자동으로 서비스에 접속됩니다.
                </AlertDescription>
              </Alert>
            ) : null}
          </Form>
          <SignInButtons />
        </CardContent>
      </Card>
      <div className="flex flex-col items-center justify-center text-sm">
        <p className="text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link
            to="/join"
            viewTransition
            data-testid="form-signup-link"
            className="text-muted-foreground hover:text-foreground text-underline underline transition-colors"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
