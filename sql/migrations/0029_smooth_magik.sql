ALTER TABLE "us_stock_expert_opinions" RENAME TO "stock_expert_opinions";--> statement-breakpoint
ALTER TABLE "stock_expert_opinions" RENAME COLUMN "us_stock_expert_opinions_id" TO "stock_expert_opinions_id";--> statement-breakpoint
ALTER TABLE "stock_expert_opinions" DROP CONSTRAINT "us_stock_expert_opinions_profile_id_profiles_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_expert_opinions" ADD COLUMN "market" text;--> statement-breakpoint
ALTER TABLE "stock_expert_opinions" ADD CONSTRAINT "stock_expert_opinions_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER POLICY "select-us-stock-expert-opinions-policy" ON "stock_expert_opinions" RENAME TO "select-stock-expert-opinions-policy";