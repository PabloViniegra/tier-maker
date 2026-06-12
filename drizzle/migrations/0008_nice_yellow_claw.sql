-- Step 1: Add slug column as nullable first (existing rows have no slug yet)
ALTER TABLE "tier_templates" ADD COLUMN "slug" text;--> statement-breakpoint

-- Step 2: Backfill slug from title using a CTE
-- For duplicate base slugs, append -1, -2, etc.
WITH numbered AS (
  SELECT
    id,
    title,
    -- Generate a base slug from title: lowercase, replace non-alphanum with hyphens, collapse hyphens
    regexp_replace(
      regexp_replace(
        regexp_replace(
          lower(title),
          '[^a-z0-9]+', '-', 'g'
        ),
        '-+', '-', 'g'
      ),
      '(^-+|-+$)', '', 'g'
    ) AS base_slug,
    row_number() OVER (PARTITION BY
      regexp_replace(
        regexp_replace(
          regexp_replace(
            lower(title),
            '[^a-z0-9]+', '-', 'g'
          ),
          '-+', '-', 'g'
        ),
        '(^-+|-+$)', '', 'g'
      )
      ORDER BY created_at ASC
    ) AS rn
  FROM tier_templates
  WHERE slug IS NULL
)
UPDATE tier_templates t
SET slug = CASE
  WHEN n.rn = 1 THEN n.base_slug
  ELSE n.base_slug || '-' || n.rn
END
FROM numbered n
WHERE t.id = n.id;--> statement-breakpoint

-- Step 3: Make slug NOT NULL now that all rows have a value
ALTER TABLE "tier_templates" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

-- Step 4: Add unique constraint and index
ALTER TABLE "tier_templates" ADD CONSTRAINT "tier_templates_slug_unique" UNIQUE("slug");--> statement-breakpoint
CREATE INDEX "tier_templates_slug_idx" ON "tier_templates" USING btree ("slug");
