CREATE TABLE "ticker_analysis" (
	"ticker_analysis_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ticker_analysis_ticker_analysis_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"ticker" text NOT NULL,
	"summary" text NOT NULL,
	"keyword" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticker_analysis" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ticker_analysis" ADD CONSTRAINT "ticker_analysis_ticker_tickers_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."tickers"("ticker") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "select-ticker-analysis-policy" ON "ticker_analysis" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE TRIGGER set_ticker_analysis_updated_at
BEFORE UPDATE ON ticker_analysis
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();