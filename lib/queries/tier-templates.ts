import 'server-only'
import { eq, desc, count, countDistinct, max, and, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates } from '@/lib/db/schema'

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

export async function getAllUserTierLists(
  userId: string
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

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    itemCount: r.sidebarItems.length,
    createdAt: r.createdAt,
  }))
}

export type TierListDetail = {
  id: string
  title: string
  description: string | null
  category: string
  sidebarItems: string[]
  createdAt: Date
  rows: {
    id: string
    label: string
    color: string
    order: number
    items: string[]
  }[]
}

export async function getTierListById(
  id: string,
  userId: string
): Promise<TierListDetail | null> {
  const [tpl] = await db
    .select()
    .from(tierTemplates)
    .where(and(eq(tierTemplates.id, id), eq(tierTemplates.creatorId, userId)))

  if (!tpl) return null

  const rows = await db
    .select()
    .from(tierRows)
    .where(eq(tierRows.templateId, id))
    .orderBy(asc(tierRows.order))

  return {
    id: tpl.id,
    title: tpl.title,
    description: tpl.description,
    category: tpl.category,
    sidebarItems: tpl.sidebarItems,
    createdAt: tpl.createdAt,
    rows: rows.map((r) => ({
      id: r.id,
      label: r.label,
      color: r.color,
      order: r.order,
      items: r.items ?? [],
    })),
  }
}
