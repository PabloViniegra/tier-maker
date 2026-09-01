'use server'

import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { tierRows, tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { purgeBlobs } from '@/lib/blob'
import { isOwnedBlobUrl } from '@/lib/blob-url'
import { revalidateExplore } from '@/lib/revalidate-explore'

function collectItemUrls(items: { url?: string }[] | null | undefined): string[] {
  if (!items) return []
  return items
    .map((i) => i.url)
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
}

export async function deleteTierList(id: string): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const [[tpl], rows] = await Promise.all([
    db
      .select({
        sidebarItems: tierTemplates.sidebarItems,
        coverImageUrl: tierTemplates.coverImageUrl,
      })
      .from(tierTemplates)
      .where(
        and(
          eq(tierTemplates.id, id),
          eq(tierTemplates.creatorId, session.user.id)
        )
      ),
    db
      .select({ items: tierRows.items })
      .from(tierRows)
      .where(eq(tierRows.templateId, id))
      .orderBy(asc(tierRows.order)),
  ])

  if (!tpl) throw new Error('Not found')

  const urlsToPurge = [
    ...(tpl.coverImageUrl ? [tpl.coverImageUrl] : []),
    ...collectItemUrls(tpl.sidebarItems),
    ...rows.flatMap((r) => collectItemUrls(r.items)),
  ].filter((url) => isOwnedBlobUrl(url, session.user.id))

  const [deleted] = await db
    .delete(tierTemplates)
    .where(
      and(
        eq(tierTemplates.id, id),
        eq(tierTemplates.creatorId, session.user.id)
      )
    )
    .returning({ id: tierTemplates.id })

  if (!deleted) throw new Error('Not found')

  await purgeBlobs(urlsToPurge)

  revalidatePath('/dashboard/tier-lists')
  revalidateExplore()

  return { ok: true }
}
