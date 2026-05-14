DROP TABLE IF EXISTS "economy_analysis" CASCADE;--> statement-breakpoint
ALTER TABLE "watchlists" ADD COLUMN "quantity" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "watchlists" ADD COLUMN "avg_price" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "watchlists" ADD COLUMN "total_asset" double precision DEFAULT 0;