import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export const createSubscription = async (
  client: SupabaseClient<Database>,
  {
    userId,
    subscriptionType,
    status,
    startedAt,
    expiresAt,
  }: {
    userId: string;
    subscriptionType: "standard" | "pro";
    status: "active";
    startedAt: Date;
    expiresAt: Date;
  },
) => {
  // upsert: 기존 구독이 있으면 업데이트, 없으면 생성
  const { data, error } = await client
    .from("subscriptions")
    .upsert(
      {
        profile_id: userId,
        subscription_type: subscriptionType,
        status,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      },
      {
        onConflict: "profile_id", // profile_id가 unique이므로 충돌 시 업데이트
      },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};
