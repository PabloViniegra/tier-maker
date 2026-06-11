'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'

export async function deleteTierList(id: string): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const [deleted] = await db
    .delete(tierTemplates)
    .where(and(eq(tierTemplates.id, id), eq(tierTemplates.creatorId, session.user.id)))
    .returning({ id: tierTemplates.id })

  if (!deleted) throw new Error('Not found')

  revalidatePath('/dashboard/tier-lists')
  revalidatePath('/explore')
  revalidateTag('public-tier-lists', {})

  return { ok: true }
}
