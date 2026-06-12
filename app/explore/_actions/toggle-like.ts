'use server'

import { revalidateTag } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierLikes } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { getTemplateCreatorId } from '@/lib/queries/tier-templates'
import { getIsLiked } from '@/lib/queries/tier-likes'
import { CACHE_TAGS } from '@/lib/cache-tags'

export async function toggleLike(
  templateId: string
): Promise<{ liked: boolean }> {
  const session = await getSession()
  if (!session) throw new Error('Authentication required')

  const [creatorId, alreadyLiked] = await Promise.all([
    getTemplateCreatorId(templateId),
    getIsLiked(session.user.id, templateId),
  ])

  if (creatorId === null) throw new Error('Tier list not found')
  if (creatorId === session.user.id)
    throw new Error('Cannot like your own tier list')

  if (alreadyLiked) {
    await db
      .delete(tierLikes)
      .where(
        and(
          eq(tierLikes.userId, session.user.id),
          eq(tierLikes.templateId, templateId)
        )
      )
    revalidateTag(CACHE_TAGS.publicTierLists, {})
    return { liked: false }
  }

  await db
    .insert(tierLikes)
    .values({ userId: session.user.id, templateId })
    .onConflictDoNothing()
  revalidateTag(CACHE_TAGS.publicTierLists, {})
  return { liked: true }
}
