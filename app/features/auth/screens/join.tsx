/**
 * User Registration Screen Component
 *
 * This component handles new user registration with:
 * - Email and password registration
 * - Form validation for all fields
 * - Terms of service and marketing consent options
 * - Social authentication providers
 * - Success confirmation with email verification instructions
 *
 * The registration flow includes validation, duplicate email checking,
 * and Supabase authentication integration.
 */
import type { Route } from "./+types/join";

import { CheckCircle2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, Link, data } from "react-router";
import { z } from "zod";

import FormButton from "~/core/components/form-button";
import FormErrors from "~/core/components/form-error";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/core/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Checkbox } from "~/core/components/ui/checkbox";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import makeServerClient from "~/core/lib/supa-client.server";

import { SignUpButtons } from "../components/auth-login-buttons";
import { doesUserExist } from "../lib/queries.server";

/**
 * Meta function for the registration page
 *
 * Sets the page title using the application name from environment variables
 */
export const meta: Route.MetaFunction = () => {
  return [
    {
      title: `Create an account | ${import.meta.env.VITE_APP_NAME}`,
    },
  ];
};

/**
 * Form validation schema for user registration
 *
 * Uses Zod to validate:
 * - Name: Required field
 * - Email: Must be a valid email format
 * - Password: Must be at least 8 characters long
 * - Confirm Password: Must match the password field
 * - Marketing: Boolean for marketing consent (defaults to false)
 * - Terms: Boolean for terms acceptance
 *
 * The schema includes a custom refinement to ensure passwords match
 *
 * 사용자 등록을 위한 폼 유효성 검사 스키마
 *
 * Zod를 사용하여 다음을 검증합니다:
 * - 이름: 필수 입력 필드
 * - 이메일: 유효한 이메일 형식이어야 함
 * - 마케팅: 마케팅 수신 동의 여부 (기본값: false)
 * - 약관: 약관 동의 여부
 */
const joinSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  marketing: z.coerce.boolean().default(true),
  terms: z.coerce.boolean(),
});

/**
 * Server action for handling user registration form submission
 *
 * This function processes the registration form data and attempts to create a new user.
 * The flow is:
 * 1. Parse and validate form data using the join schema
 * 2. Return validation errors if the data is invalid
 * 3. Verify terms of service acceptance
 * 4. Check if a user with the provided email already exists
 * 5. Create a new user with Supabase auth
 * 6. Return success or error response
 *
 * @param request - The form submission request
 * @returns Validation errors, auth errors, or success confirmation
 */
export async function action({ request }: Route.ActionArgs) {
  // Parse form data from the request
  const formData = await request.formData();
  const {
    data: validData,
    success,
    error,
  } = joinSchema.safeParse(Object.fromEntries(formData));

  // Return validation errors if form data is invalid
  if (!success) {
    return data({ fieldErrors: error.flatten().fieldErrors }, { status: 400 });
  }

  // Verify terms of service acceptance
  if (!validData.terms) {
    return data(
      { error: "이용약관 및 개인정보 수집에 동의해야 합니다." },
      { status: 400 },
    );
  }

  // Check if a user with the provided email already exists
  const userExists = await doesUserExist(validData.email);

  if (userExists) {
    return data({ error: "이미 가입된 이메일 주소입니다." }, { status: 400 });
  }

  // Create Supabase client and attempt to sign in with OTP (Magic Link)
  const [client] = makeServerClient(request);
  const { error: signInError } = await client.auth.signInWithOtp({
    email: validData.email,
    options: {
      // Store additional user metadata in Supabase auth
      data: {
        name: validData.name,
        display_name: validData.name,
        marketing_consent: validData.marketing,
      },
    },
  });

  if (signInError) {
    return data(
      { error: "인증 메일 발송 중 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 400 },
    );
  }

  // Return success response
  return {
    success: true,
  };
}

/**
 * Registration Component
 *
 * This component renders the registration form and handles user interactions.
 * It includes:
 * - Personal information fields (name, email)
 * - Password creation with confirmation
 * - Terms of service and marketing consent checkboxes
 * - Error display for form validation and registration errors
 * - Success confirmation with email verification instructions
 * - Social registration options
 * - Sign in link for existing users
 *
 * @param actionData - Data returned from the form action, including errors or success status
 */
export default function Join({ actionData }: Route.ComponentProps) {
  // Reference to the form element for resetting after successful submission
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form when registration is successful
  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success) {
      formRef.current?.reset();
      formRef.current?.blur();
    }
  }, [actionData]);
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold" role="heading">
            회원가입
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form
            className="flex w-full flex-col gap-5"
            method="post"
            ref={formRef}
          >
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="name" className="flex flex-col items-start gap-1">
                이름
              </Label>
              <Input
                id="name"
                name="name"
                required
                type="text"
                placeholder="홍길동"
              />
              {actionData &&
              "fieldErrors" in actionData &&
              actionData.fieldErrors?.name ? (
                <FormErrors errors={actionData.fieldErrors.name} />
              ) : null}
            </div>
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
              actionData.fieldErrors?.email ? (
                <FormErrors errors={actionData.fieldErrors.email} />
              ) : null}
            </div>

            <FormButton label="이메일 회원가입" className="w-full" />
            {actionData && "error" in actionData && actionData.error ? (
              <FormErrors errors={[actionData.error]} />
            ) : null}

            <div className="flex items-center gap-2">
              <Checkbox id="marketing" name="marketing" defaultChecked />
              <Label htmlFor="marketing" className="text-muted-foreground">
                마케팅 정보 수신 동의 (선택)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" name="terms" checked />
              <Label htmlFor="terms" className="text-muted-foreground">
                <span>
                  <Link
                    to="/legal/privacy-policy"
                    viewTransition
                    className="text-muted-foreground text-underline hover:text-foreground underline transition-colors"
                  >
                    개인정보 수집
                  </Link>{" "}
                  및{" "}
                  <Link
                    to="/legal/terms-of-service"
                    viewTransition
                    className="text-muted-foreground hover:text-foreground text-underline underline transition-colors"
                  >
                    이용약관{" "}
                  </Link>
                  동의
                </span>
              </Label>
            </div>
            {actionData && "success" in actionData && actionData.success ? (
              <Alert className="bg-green-600/20 text-green-700 dark:bg-green-950/20 dark:text-green-600">
                <CheckCircle2Icon
                  className="size-4"
                  color="oklch(0.627 0.194 149.214)"
                />
                <AlertTitle>인증 메일이 발송되었습니다!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-600">
                  이메일을 확인하여 로그인 링크를 클릭해주세요. 인증이 완료되면
                  자동으로 서비스에 접속됩니다.
                </AlertDescription>
              </Alert>
            ) : null}
          </Form>
          <SignUpButtons />
        </CardContent>
      </Card>
      <div className="flex flex-col items-center justify-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            viewTransition
            data-testid="form-signin-link"
            className="text-muted-foreground hover:text-foreground text-underline underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
