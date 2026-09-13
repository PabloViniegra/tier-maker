'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { assertOwned, replaceTierRows } from '@/lib/db/tier-list-mutations'
import { purgeBlobs } from '@/lib/blob'
import { isOwnedBlobUrl } from '@/lib/blob-url'
import { revalidateExplore } from '@/lib/revalidate-explore'
import {
  buildCatalogue,
  createTierListSchema,
  type CreateTierListInput,
} from '@/lib/validators/tier-list'

export async function updateTierListStructureAction(
  id: string,
  input: CreateTierListInput
): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const parsed = createTierListSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await assertOwned(id, session.user.id)

  const { title, description, category, coverImageUrl, bankItems, rows } =
    parsed.data

  const toPurge = await db.transaction(async (tx) => {
    const [[currentTemplate], currentRows] = await Promise.all([
      tx
        .select({
          coverImageUrl: tierTemplates.coverImageUrl,
          sidebarItems: tierTemplates.sidebarItems,
        })
        .from(tierTemplates)
        .where(eq(tierTemplates.id, id)),
      tx
        .select({ items: tierRows.items })
        .from(tierRows)
        .where(eq(tierRows.templateId, id)),
    ])

    const oldCatalogue = buildCatalogue(
      currentTemplate?.sidebarItems ?? [],
      currentRows
    )
    const oldUrls = [
      ...(currentTemplate?.coverImageUrl
        ? [currentTemplate.coverImageUrl]
        : []),
      ...oldCatalogue.map((item) => item.url),
    ]
    const newUrls = new Set([
      ...(coverImageUrl ? [coverImageUrl] : []),
      ...buildCatalogue(bankItems, rows).map((item) => item.url),
    ])

    await tx
      .update(tierTemplates)
      .set({
        title,
        description: description ?? null,
        category,
        coverImageUrl: coverImageUrl ?? null,
        sidebarItems: buildCatalogue(bankItems, rows),
      })
      .where(eq(tierTemplates.id, id))

    await replaceTierRows(tx, id, rows)

    return oldUrls.filter(
      (url) => !newUrls.has(url) && isOwnedBlobUrl(url, session.user.id)
    )
  })

  if (toPurge.length > 0) {
    await purgeBlobs(toPurge).catch(() => undefined)
  }

  revalidatePath(`/dashboard/tier-lists/${id}`)
  revalidatePath('/dashboard/tier-lists')
  revalidateExplore()

  return { ok: true }
}
