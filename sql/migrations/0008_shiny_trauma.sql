CREATE TABLE "economy_analysis" (
	"economy_analysis_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "economy_analysis_economy_analysis_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"vix_summary" text NOT NULL,
	"vkospi_summary" text NOT NULL,
	"kb_summary" text NOT NULL,
	"overall_summary" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
