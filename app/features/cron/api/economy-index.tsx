import {
  fetchKbIndex,
  fetchVix,
  fetchVkospi,
} from "~/core/lib/economy-service.server";
import adminClient from "~/core/lib/supa-admin-client.server";

export const loader = async () => {
  try {
    const results = await Promise.all([
      fetchVix(),
      fetchVkospi(),
      fetchKbIndex(),
    ]);

    const { error: upsertError } = await adminClient
      .from("economy_indices")
      .upsert(results, { onConflict: "symbol" })
      .select();

    if (upsertError) {
      throw new Error(`DB Upsert 에러: ${upsertError.message}`);
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
