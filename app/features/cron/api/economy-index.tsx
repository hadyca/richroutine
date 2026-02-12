import type { Route } from "./+types/economy-index";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  fetchKbIndex,
  fetchVix,
  fetchVkospi,
} from "~/core/lib/economy-service.server";
import adminClient from "~/core/lib/supa-admin-client.server";

const ai = new GoogleGenAI({});
const analysisSchema = z.object({
  vix_summary: z
    .string()
    .describe("A one-line Korean summary for the VIX index"),
  vkospi_summary: z
    .string()
    .describe("A one-line Korean summary for the VKOSPI index"),
  kb_summary: z
    .string()
    .describe("A one-line Korean summary for the KB market dominance index"),
  overall_summary: z
    .string()
    .describe(
      "A consolidated one-line Korean market sentiment summary covering all indicators",
    ),
});

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 404 });
  }
  const header = request.headers.get(process.env.CRON_SECRET!);
  if (!header || header !== process.env.CRON_SECRET!) {
    return new Response(null, { status: 404 });
  }
  try {
    const results = await Promise.all([
      fetchVix(),
      fetchVkospi(),
      fetchKbIndex(),
    ]);
    const dataContext = results
      .map(
        (r) =>
          `${r.symbol}: ${r.current_price} (${r.change_percent >= 0 ? "+" : ""}${r.change_percent.toFixed(2)}%)`,
      )
      .join(", ");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following market indicators: ${dataContext}`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(analysisSchema),
        systemInstruction: `
          # Identity
          - You are a financial and real estate market analyst.

          # Context
          - The data provided is the latest price and change percentage of the VIX, VKOSPI, and KB market dominance index.

          # Task
          - Summarize each index (VIX, VKOSPI, KB) in one line in Korean. 
          - IMPORTANT: Each summary must include both the "Current Status" and "Investment Insight/Precaution" (e.g., "be cautious," "defensive stance," "wait and see," etc.).
          - Provide a consolidated overall market sentiment and a specific investment strategy recommendation in the overall_summary.

          # Interpretation Rules
          - VIX/VKOSPI: Below 20 is Market Optimism & Stability, 20-30 is Normal Volatility Range, Above 30 is Market Fear & Oversold Phase.
          - KB: Above 100 is Buyer-Dominant, Below 100 is Seller-Dominant.

          # Output Language
          - OUTPUT MUST BE IN KOREAN.
          `,
        temperature: 0,
        topP: 0.2,
      },
    });
    const text = response.text;
    if (!text) {
      throw new Error("AI 응답이 비어있습니다.");
    }
    const analysisResult = analysisSchema.parse(JSON.parse(text));

    const { error: upsertError } = await adminClient
      .from("economy_indices")
      .insert(results)
      .select();
    if (upsertError) {
      throw new Error(`DB Upsert 에러: ${upsertError.message}`);
    }

    const { error: analysisError } = await adminClient
      .from("economy_analysis")
      .insert({ ...analysisResult })
      .select();
    if (analysisError) {
      throw new Error(`DB Insert 에러: ${analysisError.message}`);
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
