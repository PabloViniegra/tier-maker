import 'server-only'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierLikes, tierTemplates } from '@/lib/db/schema'

export async function getIsLiked(
  userId: string,
  templateId: string
): Promise<boolean> {
  const [row] = await db
    .select({ templateId: tierLikes.templateId })
    .from(tierLikes)
    .where(
      and(eq(tierLikes.userId, userId), eq(tierLikes.templateId, templateId))
    )
    .limit(1)
  return !!row
}

export async function getUserLikedTemplateIds(
  userId: string,
  templateIds?: string[]
): Promise<string[]> {
  const conditions = templateIds?.length
    ? and(
        eq(tierLikes.userId, userId),
        inArray(tierLikes.templateId, templateIds)
      )
    : eq(tierLikes.userId, userId)

  const rows = await db
    .select({ templateId: tierLikes.templateId })
    .from(tierLikes)
    .where(conditions)
  return rows.map((r) => r.templateId)
}

export const likeCountExpr = sql<number>`(
  SELECT COUNT(*)::int
  FROM tier_likes
  WHERE template_id = ${tierTemplates.id}
)`
