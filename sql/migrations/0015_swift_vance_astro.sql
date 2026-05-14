ALTER TABLE "economy_analysis" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "economy_indices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tickers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "select-economy-analysis-policy" ON "economy_analysis" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "select-economy-indices-policy" ON "economy_indices" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "select-tickers-policy" ON "tickers" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);