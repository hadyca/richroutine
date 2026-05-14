CREATE TABLE "economy_news" (
	"economy_news_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "economy_news_economy_news_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"category" text NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"url" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "economy_news" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "select-economy-news-policy" ON "economy_news" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE TRIGGER set_economy_news_updated_at
BEFORE UPDATE ON economy_news
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();