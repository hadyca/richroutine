import { type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { useNavigation } from "react-router";

import { Button, buttonVariants } from "./ui/button";

interface SubmitButtonProps
  extends Omit<React.ComponentProps<"button">, "type" | "disabled">,
    VariantProps<typeof buttonVariants> {
  /**
   * Button content when not submitting
   */
  children: React.ReactNode;
  /**
   * Text to display while submitting
   * @default "처리 중..."
   */
  loadingText?: string;
  /**
   * Custom loading icon (defaults to Loader2 spinner)
   */
  loadingIcon?: React.ReactNode;
  /**
   * Form ID to submit (optional, for buttons outside form)
   */
  form?: string;
}

/**
 * Submit Button Component
 *
 * A smart button component that automatically handles loading states
 * during form submission. It shows a spinner and disables itself while
 * the form is being submitted.
 *
 * @example
 * ```tsx
 * <Form method="post">
 *   <SubmitButton loadingText="구독 처리 중...">
 *     구독하기
 *   </SubmitButton>
 * </Form>
 * ```
 *
 * @example With custom styling
 * ```tsx
 * <SubmitButton
 *   variant="destructive"
 *   size="lg"
 *   loadingText="삭제 중..."
 * >
 *   삭제
 * </SubmitButton>
 * ```
 */
export function SubmitButton({
  children,
  loadingText = "로딩 중",
  loadingIcon,
  form,
  className,
  variant = "default",
  size = "default",
  ...props
}: SubmitButtonProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      form={form}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {isSubmitting ? (
        <>
          {loadingIcon || <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
