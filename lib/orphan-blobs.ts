import 'server-only'
import { list } from '@vercel/blob'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { purgeBlobs } from '@/lib/blob'
import { BLOB_ITEM_PREFIX } from '@/lib/blob-url'

// Uploads are only referenced once the tier list is saved, so recent blobs may
// still belong to an editor session in progress.
export const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000

async function getReferencedUrls(): Promise<Set<string>> {
  const { rows } = await db.execute<{ url: string }>(sql`
    select cover_image_url as url from tier_templates where cover_image_url is not null
    union
    select item->>'url' from tier_templates, jsonb_array_elements(sidebar_items) as item
    union
    select item->>'url' from tier_rows, jsonb_array_elements(items) as item
  `)
  return new Set(rows.map((r) => r.url))
}

export async function purgeOrphanBlobs(
  now = new Date()
): Promise<{ deleted: number }> {
  const cutoff = now.getTime() - ORPHAN_GRACE_MS
  const candidates: string[] = []
  let cursor: string | undefined

  do {
    const page = await list({ prefix: `${BLOB_ITEM_PREFIX}/`, cursor })
    for (const blob of page.blobs) {
      if (blob.uploadedAt.getTime() < cutoff) candidates.push(blob.url)
    }
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  if (candidates.length === 0) return { deleted: 0 }

  // Read references after listing so a list saved meanwhile keeps its images.
  const referenced = await getReferencedUrls()
  const orphans = candidates.filter((url) => !referenced.has(url))
  await purgeBlobs(orphans)
  return { deleted: orphans.length }
}
