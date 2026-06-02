import 'server-only'
import { eq, desc, count, countDistinct, max } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierTemplates } from '@/lib/db/schema'

export type TierListSummary = {
  id: string
  title: string
  category: string
  itemCount: number
  createdAt: Date
}

export async function getUserTierListStats(userId: string): Promise<{
  total: number
  categories: number
  lastActivity: Date | null
}> {
  const [row] = await db
    .select({
      total: count(),
      categories: countDistinct(tierTemplates.category),
      lastActivity: max(tierTemplates.createdAt),
    })
    .from(tierTemplates)
    .where(eq(tierTemplates.creatorId, userId))

  return {
    total: row?.total ?? 0,
    categories: row?.categories ?? 0,
    lastActivity: row?.lastActivity ?? null,
  }
}

export async function getRecentTierLists(
  userId: string,
  limit = 12
): Promise<TierListSummary[]> {
  const rows = await db
    .select({
      id: tierTemplates.id,
      title: tierTemplates.title,
      category: tierTemplates.category,
      sidebarItems: tierTemplates.sidebarItems,
      createdAt: tierTemplates.createdAt,
    })
    .from(tierTemplates)
    .where(eq(tierTemplates.creatorId, userId))
    .orderBy(desc(tierTemplates.createdAt))
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    itemCount: r.sidebarItems.length,
    createdAt: r.createdAt,
  }))
}
