CREATE TABLE "tier_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tier_reports_reporter_id_template_id_unique" UNIQUE("reporter_id","template_id")
);
--> statement-breakpoint
ALTER TABLE "tier_reports" ADD CONSTRAINT "tier_reports_template_id_tier_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."tier_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_reports" ADD CONSTRAINT "tier_reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tier_reports_template_id_idx" ON "tier_reports" USING btree ("template_id");