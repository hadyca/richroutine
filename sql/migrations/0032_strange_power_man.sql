ALTER TABLE "economy_news" ADD COLUMN "news_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "economy_news" ADD CONSTRAINT "economy_news_news_key_unique" UNIQUE("news_key");