CREATE TABLE "watchlists" (
	"watchlist_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "watchlists_watchlist_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"profile_id" uuid NOT NULL,
	"ticker" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watchlists_profile_id_ticker_unique" UNIQUE("profile_id","ticker")
);
--> statement-breakpoint
ALTER TABLE "watchlists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_ticker_tickers_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."tickers"("ticker") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "watchlist-select-policy" ON "watchlists" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "watchlists"."profile_id");--> statement-breakpoint
CREATE POLICY "watchlist-insert-policy" ON "watchlists" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "watchlists"."profile_id");--> statement-breakpoint
CREATE POLICY "watchlist-delete-policy" ON "watchlists" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "watchlists"."profile_id");--> statement-breakpoint
CREATE TRIGGER set_watchlists_updated_at
BEFORE UPDATE ON watchlists
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();