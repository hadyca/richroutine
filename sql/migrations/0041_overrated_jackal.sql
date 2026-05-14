CREATE TABLE "portfolio_news" (
	"portfolio_news_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "portfolio_news_portfolio_news_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"ticker" text NOT NULL,
	"uuid" text NOT NULL,
	"title" text NOT NULL,
	"publisher" text,
	"url" text NOT NULL,
	"provider_publish_time" bigint,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_news_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "portfolio_news" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "portfolio_news" ADD CONSTRAINT "portfolio_news_ticker_tickers_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."tickers"("ticker") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "select-portfolio-news-policy" ON "portfolio_news" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);