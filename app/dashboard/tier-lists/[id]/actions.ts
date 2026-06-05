'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import type { ImageItem } from '@/lib/validators/tier-list'

export type UpdateTierListPayload = {
  coverImageUrl?: string
  bankItems: ImageItem[]
  rows: Array<{
    id: string
    label: string
    color: string
    items: ImageItem[]
  }>
}

export async function updateTierListAction(
  id: string,
  payload: UpdateTierListPayload
): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const [owned] = await db
    .select({ id: tierTemplates.id })
    .from(tierTemplates)
    .where(and(eq(tierTemplates.id, id), eq(tierTemplates.creatorId, session.user.id)))

  if (!owned) throw new Error('Not found')

  await db.transaction(async (tx) => {
    await tx
      .update(tierTemplates)
      .set({
        sidebarItems: payload.bankItems,
        coverImageUrl: payload.coverImageUrl ?? null,
      })
      .where(eq(tierTemplates.id, id))

    await tx.delete(tierRows).where(eq(tierRows.templateId, id))

    if (payload.rows.length > 0) {
      await tx.insert(tierRows).values(
        payload.rows.map((row, index) => ({
          id: row.id,
          templateId: id,
          label: row.label,
          color: row.color,
          order: index,
          items: row.items,
        }))
      )
    }
  })

  revalidatePath(`/dashboard/tier-lists/${id}`)
  revalidatePath('/dashboard/tier-lists')

  return { ok: true }
}
