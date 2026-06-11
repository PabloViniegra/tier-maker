CREATE TABLE "tier_likes" (
	"user_id" text NOT NULL,
	"template_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tier_likes_user_id_template_id_pk" PRIMARY KEY("user_id","template_id")
);
--> statement-breakpoint
ALTER TABLE "tier_likes" ADD CONSTRAINT "tier_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_likes" ADD CONSTRAINT "tier_likes_template_id_tier_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."tier_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tier_likes_template_id_idx" ON "tier_likes" USING btree ("template_id");