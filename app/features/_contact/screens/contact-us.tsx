/**
 * Contact Form Page with CAPTCHA Integration
 *
 * This module implements a contact form with dual CAPTCHA protection using both
 * HCaptcha and Turnstile (Cloudflare). It demonstrates how to integrate multiple
 * CAPTCHA providers for enhanced protection against automated submissions.
 *
 * The form includes:
 * - Basic contact information fields (name, email, message)
 * - Server-side validation using Zod schemas
 * - CAPTCHA verification with both HCaptcha and Turnstile
 * - Email sending via Resend API
 * - Form state management and user feedback
 *
 * This implementation serves as a demonstration of how to implement robust
 * form protection and validation in a production application.
 *
 * CAPTCHA 연동 문의 양식 페이지
 *
 * 이 모듈은 HCaptcha와 Turnstile(Cloudflare)을 모두 사용하여 이중 CAPTCHA 보호 기능이 포함된 문의 양식을 구현합니다.
 * 자동화된 제출에 대한 보호를 강화하기 위해 여러 CAPTCHA 제공업체를 통합하는 방법을 보여줍니다.
 *
 * 양식 포함 사항:
 * - 기본 연락처 정보 필드 (이름, 이메일, 메시지)
 * - Zod 스키마를 사용한 서버 측 유효성 검사
 * - HCaptcha 및 Turnstile을 사용한 CAPTCHA 검증
 * - Resend API를 통한 이메일 전송
 * - 양식 상태 관리 및 사용자 피드백
 *
 * 이 구현은 프로덕션 애플리케이션에서 강력한 양식 보호 및 유효성 검사를 구현하는 방법에 대한 데모 역할을 합니다.
 */
import { useEffect, useRef, useState } from "react";
import { Form, data } from "react-router";
import Turnstile, { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { z } from "zod";

import FormButton from "~/core/components/form-button";
import FormErrors from "~/core/components/form-error";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import resendClient from "~/core/lib/resend-client.server";
import { isTurnstileTokenValid } from "~/core/lib/turnstile.server";

/**
 * Meta function for setting page metadata
 *
 * This function sets the page title for the Contact Us page,
 * using the application name from environment variables.
 *
 * @returns Array of metadata objects for the page
 */
export const meta: Route.MetaFunction = () => {
  return [
    {
      title: `Contact Us | ${import.meta.env.VITE_APP_NAME}`,
    },
  ];
};

/**
 * Validates an HCaptcha token with HCaptcha's API
 *
 * This function sends the token received from the client-side HCaptcha widget
 * to HCaptcha's verification endpoint to confirm that the user successfully
 * completed the CAPTCHA challenge.
 *
 * The verification process:
 * 1. Sends the token and secret key to HCaptcha's verification endpoint
 * 2. Parses the JSON response to determine if the token is valid
 * 3. Returns a boolean indicating success or failure
 * 4. Handles errors gracefully, logging them and returning false
 *
 * @param token - The token received from the client-side HCaptcha widget
 * @returns Promise resolving to a boolean indicating if the token is valid
 */
// async function isHcaptchaTokenValid(token: string) {
//   try {
//     // HCaptcha's verification endpoint
//     const url = "https://api.hcaptcha.com/siteverify";

//     // Send verification request to HCaptcha
//     // Note: HCaptcha requires form-urlencoded format unlike Turnstile
//     const result = await fetch(url, {
//       body: new URLSearchParams({
//         secret: process.env.HCAPTCHA_SECRET_KEY!,
//         response: token,
//       }),
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     });

//     // Parse response and return success status
//     const outcome = await result.json();
//     return outcome.success;
//   } catch (error) {
//     // Log error and return false on failure
//     console.error(error);
//     return false;
//   }
// }

/**
 * Validation schema for contact form submissions
 *
 * This schema defines the required fields and validation rules for the contact form:
 * - name: Required, must be at least 1 character
 * - email: Required, must be a valid email format
 * - message: Required, must be at least 1 character
 * - hcaptcha: Required, must contain a valid HCaptcha token
 * - turnstile: Required, must contain a valid Turnstile token
 *
 * The schema is used with Zod's safeParse method to validate form submissions
 * before processing them further.
 */
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  turnstile: z.string().min(1),
});

/**
 * Action handler for processing contact form submissions
 *
 * This function processes form submissions from the contact page. It follows these steps:
 * 1. Extracts and validates form data using the Zod schema
 * 2. Verifies both CAPTCHA tokens with their respective services
 * 3. Sends an email to the admin with the contact information
 * 4. Returns appropriate success or error responses
 *
 * Security considerations:
 * - Validates all form fields to prevent invalid data
 * - Verifies CAPTCHA tokens to prevent spam and automated submissions
 * - Uses server-side validation to prevent client-side bypass
 * - Handles errors gracefully with appropriate status codes
 *
 * 문의 양식 제출을 처리하는 액션 핸들러입니다.
 *
 * 이 함수는 문의 페이지의 양식 제출을 처리합니다. 다음 단계를 따릅니다:
 * 1. Zod 스키마를 사용하여 양식 데이터를 추출하고 검증합니다.
 * 2. 각 서비스에서 CAPTCHA 토큰을 검증합니다.
 * 3. 문의 정보와 함께 관리자에게 이메일을 보냅니다.
 * 4. 적절한 성공 또는 오류 응답을 반환합니다.
 *
 * 보안 고려 사항:
 * - 잘못된 데이터를 방지하기 위해 모든 양식 필드를 검증합니다.
 * - 스팸 및 자동 제출을 방지하기 위해 CAPTCHA 토큰을 확인합니다.
 * - 클라이언트 측 우회를 방지하기 위해 서버 측 검증을 사용합니다.
 * - 적절한 상태 코드와 함께 오류를 적절히 처리합니다.
 *
 * @param request - The incoming HTTP request with form data / 양식 데이터가 포함된 HTTP 요청
 * @returns JSON response indicating success or error with appropriate details / 적절한 세부 정보와 함께 성공 또는 오류를 나타내는 JSON 응답
 */
export async function action({ request }: Route.ActionArgs) {
  // Extract form data from the request
  const formData = await request.formData();

  // Validate form data using the Zod schema
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    // Return validation errors if the form data is invalid
    return data(
      { fieldErrors: result.error.flatten().fieldErrors, success: false },
      { status: 400 },
    );
  }

  // Extract validated data
  const { name, email, message, turnstile } = result.data;

  // Verify both CAPTCHA tokens in parallel
  const validTurnstile = await isTurnstileTokenValid(turnstile);

  // Return error if either CAPTCHA verification fails
  if (!validTurnstile) {
    return data(
      {
        errors: {
          turnstile: !validTurnstile
            ? ["Invalid captcha, please try again"]
            : [],
        },
        success: false,
      },
      { status: 400 },
    );
  }

  // Send email to admin with contact information
  const { error } = await resendClient.emails.send({
    from: "Supaplate <hello@supaplate.com>",
    to: [process.env.ADMIN_EMAIL!],
    subject: "New contact from Supaplate",
    html: `
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b> ${message}</p>
    `,
  });

  // Handle email sending errors
  if (error) {
    return data({ error, success: false }, { status: 500 });
  }

  // Return success response
  return {
    success: true,
    error: null,
  };
}

/**
 * Contact Us Form Component
 *
 * This component renders a contact form with dual CAPTCHA protection.
 * It manages form state, CAPTCHA tokens, and provides user feedback
 * based on the form submission results.
 *
 * @param actionData - Data returned from the action function after form submission
 */
export default function ContactUs({ actionData }: Route.ComponentProps) {
  // State for storing CAPTCHA tokens from both providers

  const [turnstileToken, setTurnstileToken] = useState<string>("");

  // State to control when to render CAPTCHA widgets (prevents SSR issues)
  const [renderCaptchas, setRenderCaptchas] = useState<boolean>(false);

  // References to interact with CAPTCHA widgets and form

  const turnstile = useTurnstile(); // Hook for Turnstile widget interactions
  const formRef = useRef<HTMLFormElement>(null); // Reference to the form element

  /**
   * Effect for handling form submission results
   *
   * This effect runs whenever actionData changes (after form submission).
   * It handles:
   * 1. Resetting both CAPTCHA widgets
   * 2. Clearing CAPTCHA tokens
   * 3. Showing success or error messages
   * 4. Resetting the form on successful submission
   */
  // Handle form submission results: reset captcha, reset form on success, or show captcha on error
  useEffect(() => {
    if (!actionData) return;

    // Reset both CAPTCHA widgets and their tokens
    turnstile.reset();
    setTurnstileToken("");

    // Handle successful submission
    if (actionData?.success) {
      toast.success("Email sent successfully");
      formRef.current?.reset();
      formRef.current?.querySelectorAll("input").forEach((input) => {
        input.blur();
      });
    }
    // Ensure CAPTCHA is visible if there are validation errors
    else if ("fieldErrors" in actionData || "errors" in actionData) {
      setRenderCaptchas(true);
    }
    // Handle specific error messages
    else if ("error" in actionData && actionData.error) {
      toast.error(actionData.error.message);
    }
  }, [actionData]);
  /**
   * Render the contact form with dual CAPTCHA protection
   *
   * The component renders:
   * 1. A header section with title and description
   * 2. A form with name, email, and message fields
   * 3. Two CAPTCHA widgets (HCaptcha and Turnstile)
   * 4. A submit button that is disabled until both CAPTCHAs are verified
   * 5. Error messages for field validation and CAPTCHA verification
   */
  return (
    <div className="flex flex-col items-center gap-20">
      {/* Header section */}
      <div>
        <h1 className="text-center text-3xl font-semibold tracking-tight md:text-5xl">
          Contact Us
        </h1>
        <p className="text-muted-foreground mt-2 text-center font-medium md:text-lg">
          This is a page to demo HCaptcha and Turnstile captchas.
        </p>
      </div>

      {/* Contact form */}
      <Form
        method="post"
        ref={formRef}
        className="flex w-full max-w-2xl flex-col gap-5"
        onChange={() => !renderCaptchas && setRenderCaptchas(true)}
      >
        {/* Name field */}
        <div className="flex flex-col items-start space-y-2">
          <Label htmlFor="name" className="flex flex-col items-start gap-1">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            required
            type="text"
            placeholder="Enter your name"
          />
          {/* Display name field validation errors if any */}
          {actionData &&
          "fieldErrors" in actionData &&
          actionData.fieldErrors?.name ? (
            <FormErrors errors={actionData.fieldErrors.name} />
          ) : null}
        </div>

        {/* Email field */}
        <div className="flex flex-col items-start space-y-2">
          <Label htmlFor="email" className="flex flex-col items-start gap-1">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            required
            type="email"
            placeholder="Enter your email"
          />
          {/* Display email field validation errors if any */}
          {actionData &&
          "fieldErrors" in actionData &&
          actionData.fieldErrors?.email ? (
            <FormErrors errors={actionData.fieldErrors.email} />
          ) : null}
        </div>

        {/* Message field */}
        <div className="flex flex-col items-start space-y-2">
          <Label htmlFor="message" className="flex flex-col items-start gap-1">
            Message
          </Label>
          <Textarea
            id="message"
            name="message"
            required
            placeholder="Enter your message"
            className="h-32 resize-none"
          />
          {/* Display message field validation errors if any */}
          {actionData &&
          "fieldErrors" in actionData &&
          actionData.fieldErrors?.message ? (
            <FormErrors errors={actionData.fieldErrors.message} />
          ) : null}
        </div>

        {/* Hidden fields for CAPTCHA tokens */}

        <input type="hidden" name="turnstile" value={turnstileToken} required />

        {/* CAPTCHA widgets - only rendered when user interacts with form or there are errors */}
        {renderCaptchas ? (
          <div className="flex w-full justify-center">
            {/* Turnstile widget container */}
            <div className="flex flex-col items-center">
              <Turnstile
                sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onVerify={(token) => {
                  setTurnstileToken(token);
                }}
              />
              {/* Display Turnstile verification errors if any */}
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

        {/* Informational note about the dual CAPTCHA implementation */}
        <span className="text-center text-sm text-amber-500">
          Note: This is a demo, you will not render two captchas at the same
          time.
          <br />
          You will have to choose between HCaptcha and Turnstile.
        </span>

        {/* Submit button - disabled until both CAPTCHAs are verified */}
        <FormButton
          type="submit"
          className="w-full"
          disabled={!turnstileToken}
          label="Send"
        />
      </Form>
    </div>
  );
}
