'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { replaceTierRows } from '@/lib/db/tier-list-mutations'
import { z } from 'zod'
import { updateTierListPayloadSchema } from '@/lib/validators/tier-list'

export type UpdateTierListPayload = z.infer<typeof updateTierListPayloadSchema>

export async function updateTierListAction(
  id: string,
  payload: UpdateTierListPayload
): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const parsed = updateTierListPayloadSchema.safeParse(payload)
  if (!parsed.success) throw new Error('Invalid payload')

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(tierTemplates)
      .set({
        sidebarItems: parsed.data.bankItems,
        coverImageUrl: parsed.data.coverImageUrl ?? null,
      })
      .where(and(eq(tierTemplates.id, id), eq(tierTemplates.creatorId, session.user.id)))
      .returning({ id: tierTemplates.id })

    if (!updated) throw new Error('Not found')

    await replaceTierRows(tx, id, parsed.data.rows)
  })

  revalidatePath(`/dashboard/tier-lists/${id}`)
  revalidatePath('/dashboard')
  revalidatePath('/explore')
  revalidateTag('public-tier-lists', {})

  return { ok: true }
}
