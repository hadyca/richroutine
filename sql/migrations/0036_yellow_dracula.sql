CREATE TABLE "market_indices" (
	"market_indices_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "market_indices_market_indices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"price" double precision NOT NULL,
	"change_percent" double precision NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_indices_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
ALTER TABLE "market_indices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "select-market-indices-policy" ON "market_indices" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE TRIGGER set_market_indices_updated_at -- <- name of the trigger
BEFORE UPDATE ON market_indices
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();