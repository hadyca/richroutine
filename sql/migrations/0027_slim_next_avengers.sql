CREATE TABLE "us_stock_expert_opinions" (
	"us_stock_expert_opinions_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "us_stock_expert_opinions_us_stock_expert_opinions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"summary" text NOT NULL,
	"strategy_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "us_stock_expert_opinions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "select-us-stock-expert-opinions-policy" ON "us_stock_expert_opinions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE TRIGGER set_us_stock_expert_opinions_updated_at
BEFORE UPDATE ON us_stock_expert_opinions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();