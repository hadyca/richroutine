CREATE TABLE "subscriptions" (
	"subscription_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subscriptions_subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"profile_id" uuid NOT NULL,
	"subscription_type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "select-subscription-policy" ON "subscriptions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "subscriptions"."profile_id");--> statement-breakpoint
CREATE POLICY "update-subscription-policy" ON "subscriptions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "subscriptions"."profile_id") WITH CHECK ((select auth.uid()) = "subscriptions"."profile_id");--> statement-breakpoint
CREATE POLICY "insert-subscription-policy" ON "subscriptions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "subscriptions"."profile_id");--> statement-breakpoint
CREATE POLICY "delete-subscription-policy" ON "subscriptions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "subscriptions"."profile_id");