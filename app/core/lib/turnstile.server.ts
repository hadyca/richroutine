/**
 * Validates a Turnstile CAPTCHA token with Cloudflare's API
 *
 * This function sends the token received from the client-side Turnstile widget
 * to Cloudflare's verification endpoint to confirm that the user successfully
 * completed the CAPTCHA challenge.
 *
 * @param token - The token received from the client-side Turnstile widget
 * @returns Promise resolving to a boolean indicating if the token is valid
 */
export async function isTurnstileTokenValid(token: string) {
  try {
    // Cloudflare's verification endpoint
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    // Send verification request to Cloudflare
    const result = await fetch(url, {
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Parse response and return success status
    const outcome = await result.json();
    return outcome.success;
  } catch (error) {
    // Log error and return false on failure
    console.error("Turnstile verification error:", error);
    return false;
  }
}
