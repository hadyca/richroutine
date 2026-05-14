CREATE TABLE "economy_indices" (
	"economy_indices_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "economy_indices_economy_indices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"symbol" text NOT NULL,
	"current_price" double precision NOT NULL,
	"change_percent" double precision,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "economy_indices_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
ALTER TABLE "economy_indices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "select-economy-indices-policy" ON "economy_indices" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);