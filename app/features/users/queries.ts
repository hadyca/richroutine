import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import { redirect } from "react-router";

export async function getUserProfile(
  client: SupabaseClient<Database>,
  { userId }: { userId: string | null },
) {
  if (!userId) {
    return null;
  }
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("profile_id", userId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export const getLoggedInUserId = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.auth.getUser();
  if (error || data.user === null) {
    throw redirect("/login");
  }
  return data.user.id;
};

export async function getTotalUserCount(client: SupabaseClient<Database>) {
  // Call the database function that bypasses RLS to get accurate total count
  // The SQL function is defined in sql/functions/get_total_user_count.sql
  // @ts-expect-error - RPC function not yet in generated types
  const { data, error } = await client.rpc("get_total_user_count");

  if (error) {
    console.error("Error getting total user count:", error);
    // Fallback to 0 instead of throwing to prevent page crashes
    return 0;
  }

  return Number(data) ?? 0;
}
