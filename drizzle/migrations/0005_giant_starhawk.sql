CREATE INDEX "tier_rows_template_id_idx" ON "tier_rows" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "tier_templates_creator_id_idx" ON "tier_templates" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "tier_templates_is_public_created_at_idx" ON "tier_templates" USING btree ("is_public","created_at");