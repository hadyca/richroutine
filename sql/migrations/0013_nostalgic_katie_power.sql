CREATE TABLE "tickers" (
	"tickers_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tickers_tickers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"ticker" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ko" text,
	"market" text NOT NULL,
	"exchange" text NOT NULL,
	"logo_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "economy_analysis" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "economy_indices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "economy_indices" RENAME COLUMN "symbol" TO "ticker";--> statement-breakpoint
DROP POLICY "select-economy-analysis-policy" ON "economy_analysis" CASCADE;--> statement-breakpoint
DROP POLICY "select-economy-indices-policy" ON "economy_indices" CASCADE;