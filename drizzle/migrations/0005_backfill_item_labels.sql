-- Backfill sidebar_items: convert string[] → {url, label}[]
-- Only touches rows where the first element is a plain string (old format)
UPDATE tier_templates
SET sidebar_items = (
  SELECT jsonb_agg(jsonb_build_object('url', elem, 'label', 'Image'))
  FROM jsonb_array_elements_text(sidebar_items) AS elem
)
WHERE jsonb_array_length(sidebar_items) > 0
  AND jsonb_typeof(sidebar_items -> 0) = 'string';

-- Backfill tier_rows.items: convert string[] → {url, label}[]
UPDATE tier_rows
SET items = (
  SELECT jsonb_agg(jsonb_build_object('url', elem, 'label', 'Image'))
  FROM jsonb_array_elements_text(items) AS elem
)
WHERE jsonb_array_length(items) > 0
  AND jsonb_typeof(items -> 0) = 'string';
