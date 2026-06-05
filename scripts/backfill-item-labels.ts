import ws from 'ws'
import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { sql } from 'drizzle-orm'

neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URI! })
const db = drizzle(pool)

async function backfill() {
  console.log('Backfilling sidebar_items...')
  const r1 = await db.execute(sql`
    UPDATE tier_templates
    SET sidebar_items = (
      SELECT jsonb_agg(jsonb_build_object('url', elem, 'label', 'Image'))
      FROM jsonb_array_elements_text(sidebar_items) AS elem
    )
    WHERE jsonb_array_length(sidebar_items) > 0
      AND jsonb_typeof(sidebar_items -> 0) = 'string'
  `)
  console.log('tier_templates updated:', r1.rowCount, 'rows')

  console.log('Backfilling tier_rows.items...')
  const r2 = await db.execute(sql`
    UPDATE tier_rows
    SET items = (
      SELECT jsonb_agg(jsonb_build_object('url', elem, 'label', 'Image'))
      FROM jsonb_array_elements_text(items) AS elem
    )
    WHERE jsonb_array_length(items) > 0
      AND jsonb_typeof(items -> 0) = 'string'
  `)
  console.log('tier_rows updated:', r2.rowCount, 'rows')

  await pool.end()
  console.log('Done.')
}

backfill().catch((e) => { console.error(e); process.exit(1) })
