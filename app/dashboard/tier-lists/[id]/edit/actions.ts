'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { assertOwned, replaceTierRows } from '@/lib/db/tier-list-mutations'
import { createTierListSchema, type CreateTierListInput } from '@/lib/validators/tier-list'

export async function updateTierListStructureAction(
  id: string,
  input: CreateTierListInput
): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const parsed = createTierListSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await assertOwned(id, session.user.id)

  const { title, description, category, coverImageUrl, bankItems, rows } = parsed.data

  await db.transaction(async (tx) => {
    await tx
      .update(tierTemplates)
      .set({
        title,
        description: description ?? null,
        category,
        coverImageUrl: coverImageUrl ?? null,
        sidebarItems: bankItems,
      })
      .where(eq(tierTemplates.id, id))

    await replaceTierRows(tx, id, rows)
  })

  revalidatePath(`/dashboard/tier-lists/${id}`)
  revalidatePath('/dashboard/tier-lists')

  return { ok: true }
}
