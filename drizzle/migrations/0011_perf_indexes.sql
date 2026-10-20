CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
DROP INDEX "tier_templates_creator_id_idx";--> statement-breakpoint
DROP INDEX "tier_templates_slug_idx";--> statement-breakpoint
CREATE INDEX "tier_templates_creator_id_created_at_idx" ON "tier_templates" USING btree ("creator_id","created_at");--> statement-breakpoint
CREATE INDEX "tier_templates_title_trgm_idx" ON "tier_templates" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "tier_templates_description_trgm_idx" ON "tier_templates" USING gin ("description" gin_trgm_ops);