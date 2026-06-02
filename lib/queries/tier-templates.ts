import 'server-only'
import { eq, desc } from 'drizzle-orm'
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
  const rows = await db
    .select({
      id: tierTemplates.id,
      category: tierTemplates.category,
      createdAt: tierTemplates.createdAt,
    })
    .from(tierTemplates)
    .where(eq(tierTemplates.creatorId, userId))

  if (rows.length === 0) {
    return { total: 0, categories: 0, lastActivity: null }
  }

  const distinctCategories = new Set(rows.map((r) => r.category)).size
  const lastActivity = rows.reduce(
    (max, r) => (r.createdAt > max ? r.createdAt : max),
    rows[0].createdAt
  )

  return {
    total: rows.length,
    categories: distinctCategories,
    lastActivity,
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
