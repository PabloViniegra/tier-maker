import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import {
  eq,
  desc,
  count,
  countDistinct,
  max,
  and,
  asc,
  or,
  ilike,
  sql,
  gte,
} from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates } from '@/lib/db/schema'
import { user } from '@/lib/db/schema/auth'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { likeCountExpr } from '@/lib/queries/tier-likes'
import type { ImageItem } from '@/lib/validators/tier-list'
import { bucketByDay } from '@/lib/utils/stats-series'

const sidebarItemCount = sql<number>`COALESCE(jsonb_array_length(${tierTemplates.sidebarItems}), 0)`

export type TierListSummary = {
  id: string
  slug: string
  title: string
  category: string
  itemCount: number
  createdAt: Date
  coverImageUrl: string | null
  firstItemUrl: string | null
  isPublic: boolean
}

const STATS_WINDOW_DAYS = 14

export type TierListStats = {
  total: number
  categories: number
  lastActivity: Date | null
  /** Daily counts for tier lists created over the last STATS_WINDOW_DAYS days (oldest→newest) */
  totalSeries: number[]
  /** Tier lists created in the current STATS_WINDOW_DAYS window — delta numerator */
  totalCurrent: number
  /** Tier lists created in the previous STATS_WINDOW_DAYS window — delta denominator */
  totalPrev: number
  /** Distinct categories used in the current STATS_WINDOW_DAYS window — delta numerator */
  categoriesCurrent: number
  /** Distinct categories used in the previous STATS_WINDOW_DAYS window — delta denominator */
  categoriesPrev: number
}

// React cache() deduplicates repeated calls within a single request/render pass.
// unstable_cache is intentionally NOT used here: mutations call revalidatePath('/dashboard')
// rather than a user-scoped tag, so wiring a cache tag would require invasive changes to all
// mutation actions. cache() gives per-request dedup with zero stale-data risk.
export const getUserTierListStats = cache(async function getUserTierListStats(
  userId: string
): Promise<TierListStats> {
  const now = new Date()
  const windowStart = new Date(
    now.getTime() - STATS_WINDOW_DAYS * 24 * 60 * 60 * 1000
  )
  const prevWindowStart = new Date(
    windowStart.getTime() - STATS_WINDOW_DAYS * 24 * 60 * 60 * 1000
  )

  const [aggregateRow, recentRows] = await Promise.all([
    db
      .select({
        total: count(),
        categories: countDistinct(tierTemplates.category),
        lastActivity: max(tierTemplates.createdAt),
      })
      .from(tierTemplates)
      .where(eq(tierTemplates.creatorId, userId))
      .then(([r]) => r),
    // Fetch last 28 days of rows (current + prev window) for series and delta computation.
    // Capped at 2000 rows: a user creating >100 lists/day over 28 days is far beyond normal
    // usage; the cap prevents runaway memory on pathological data while keeping stats correct
    // for all realistic workloads.
    db
      .select({
        createdAt: tierTemplates.createdAt,
        category: tierTemplates.category,
      })
      .from(tierTemplates)
      .where(
        and(
          eq(tierTemplates.creatorId, userId),
          gte(tierTemplates.createdAt, prevWindowStart)
        )
      )
      .limit(2000),
  ])

  const currentWindowRows = recentRows.filter((r) => r.createdAt >= windowStart)
  const prevWindowRows = recentRows.filter(
    (r) => r.createdAt >= prevWindowStart && r.createdAt < windowStart
  )

  const totalSeries = bucketByDay(
    currentWindowRows.map((r) => r.createdAt),
    STATS_WINDOW_DAYS,
    now
  )
  const totalCurrent = currentWindowRows.length
  const totalPrev = prevWindowRows.length
  const categoriesCurrent = new Set(currentWindowRows.map((r) => r.category))
    .size
  const categoriesPrev = new Set(prevWindowRows.map((r) => r.category)).size

  return {
    total: aggregateRow?.total ?? 0,
    categories: aggregateRow?.categories ?? 0,
    lastActivity: aggregateRow?.lastActivity ?? null,
    totalSeries,
    totalCurrent,
    totalPrev,
    categoriesCurrent,
    categoriesPrev,
  }
})

const firstItemUrlExpr = sql<string | null>`
  COALESCE(
    (${tierTemplates.sidebarItems} -> 0 ->> 'url'),
    (
      SELECT items -> 0 ->> 'url'
      FROM tier_rows
      WHERE template_id = ${tierTemplates.id}
        AND jsonb_array_length(items) > 0
      ORDER BY "order" ASC
      LIMIT 1
    )
  )
`

export async function getRecentTierLists(
  userId: string,
  limit = 12
): Promise<TierListSummary[]> {
  const rows = await db
    .select({
      id: tierTemplates.id,
      slug: tierTemplates.slug,
      title: tierTemplates.title,
      category: tierTemplates.category,
      itemCount: sidebarItemCount,
      coverImageUrl: tierTemplates.coverImageUrl,
      createdAt: tierTemplates.createdAt,
      firstItemUrl: firstItemUrlExpr,
      isPublic: tierTemplates.isPublic,
    })
    .from(tierTemplates)
    .where(eq(tierTemplates.creatorId, userId))
    .orderBy(desc(tierTemplates.createdAt))
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    itemCount: r.itemCount ?? 0,
    createdAt: r.createdAt,
    coverImageUrl: r.coverImageUrl ?? null,
    firstItemUrl: r.firstItemUrl ?? null,
    isPublic: r.isPublic,
  }))
}

export async function getAllUserTierLists(
  userId: string
): Promise<(TierListSummary & { likeCount: number })[]> {
  const rows = await db
    .select({
      id: tierTemplates.id,
      slug: tierTemplates.slug,
      title: tierTemplates.title,
      category: tierTemplates.category,
      itemCount: sidebarItemCount,
      coverImageUrl: tierTemplates.coverImageUrl,
      createdAt: tierTemplates.createdAt,
      firstItemUrl: firstItemUrlExpr,
      likeCount: likeCountExpr,
      isPublic: tierTemplates.isPublic,
    })
    .from(tierTemplates)
    .where(eq(tierTemplates.creatorId, userId))
    .orderBy(desc(tierTemplates.createdAt))
    .limit(200)

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    itemCount: r.itemCount ?? 0,
    createdAt: r.createdAt,
    coverImageUrl: r.coverImageUrl ?? null,
    firstItemUrl: r.firstItemUrl ?? null,
    likeCount: r.likeCount ?? 0,
    isPublic: r.isPublic,
  }))
}

export type TierListDetail = {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  coverImageUrl: string | null
  sidebarItems: ImageItem[]
  createdAt: Date
  creatorId: string | null
  likeCount: number
  rows: {
    id: string
    label: string
    color: string
    order: number
    items: ImageItem[]
  }[]
}

export type PublicTierListSummary = TierListSummary & {
  creatorName: string | null
  creatorId: string | null
  likeCount: number
}

export type ExploreSort = 'newest' | 'oldest' | 'a-z' | 'popular'

export type PublicTierListsParams = {
  q?: string
  category?: string
  sort?: ExploreSort
  page: number
  pageSize: number
}

export async function getPublicTierListById(
  id: string
): Promise<TierListDetail | null> {
  const [[tpl], rows] = await Promise.all([
    db
      .select({
        id: tierTemplates.id,
        slug: tierTemplates.slug,
        title: tierTemplates.title,
        description: tierTemplates.description,
        category: tierTemplates.category,
        coverImageUrl: tierTemplates.coverImageUrl,
        sidebarItems: tierTemplates.sidebarItems,
        createdAt: tierTemplates.createdAt,
        creatorId: tierTemplates.creatorId,
        likeCount: likeCountExpr,
      })
      .from(tierTemplates)
      .where(and(eq(tierTemplates.id, id), eq(tierTemplates.isPublic, true))),
    db
      .select()
      .from(tierRows)
      .where(eq(tierRows.templateId, id))
      .orderBy(asc(tierRows.order)),
  ])

  if (!tpl) return null

  return {
    id: tpl.id,
    slug: tpl.slug,
    title: tpl.title,
    description: tpl.description,
    category: tpl.category,
    coverImageUrl: tpl.coverImageUrl ?? null,
    sidebarItems: tpl.sidebarItems,
    createdAt: tpl.createdAt,
    creatorId: tpl.creatorId ?? null,
    likeCount: tpl.likeCount ?? 0,
    rows: rows.map((r) => ({
      id: r.id,
      label: r.label,
      color: r.color,
      order: r.order,
      items: r.items ?? [],
    })),
  }
}

export async function getPublicTierListBySlug(
  slug: string
): Promise<TierListDetail | null> {
  const [tpl] = await db
    .select({
      id: tierTemplates.id,
      slug: tierTemplates.slug,
      title: tierTemplates.title,
      description: tierTemplates.description,
      category: tierTemplates.category,
      coverImageUrl: tierTemplates.coverImageUrl,
      sidebarItems: tierTemplates.sidebarItems,
      createdAt: tierTemplates.createdAt,
      creatorId: tierTemplates.creatorId,
      likeCount: likeCountExpr,
    })
    .from(tierTemplates)
    .where(and(eq(tierTemplates.slug, slug), eq(tierTemplates.isPublic, true)))
    .limit(1)

  if (!tpl) return null

  const rows = await db
    .select()
    .from(tierRows)
    .where(eq(tierRows.templateId, tpl.id))
    .orderBy(asc(tierRows.order))

  return {
    id: tpl.id,
    slug: tpl.slug,
    title: tpl.title,
    description: tpl.description,
    category: tpl.category,
    coverImageUrl: tpl.coverImageUrl ?? null,
    sidebarItems: tpl.sidebarItems,
    createdAt: tpl.createdAt,
    creatorId: tpl.creatorId ?? null,
    likeCount: tpl.likeCount ?? 0,
    rows: rows.map((r) => ({
      id: r.id,
      label: r.label,
      color: r.color,
      order: r.order,
      items: r.items ?? [],
    })),
  }
}

export const getDistinctPublicCategories = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await db
      .select({ category: tierTemplates.category })
      .from(tierTemplates)
      .where(eq(tierTemplates.isPublic, true))
      .groupBy(tierTemplates.category)
      .orderBy(asc(tierTemplates.category))

    return rows.map((r) => r.category)
  },
  ['distinct-public-categories'],
  { revalidate: 300, tags: [CACHE_TAGS.publicCategories] }
)

export const getPublicTierLists = unstable_cache(
  async (
    params: PublicTierListsParams
  ): Promise<{ items: PublicTierListSummary[]; total: number }> => {
    const { q, category, sort = 'newest', page, pageSize } = params

    const conditions = and(
      eq(tierTemplates.isPublic, true),
      q
        ? or(
            ilike(tierTemplates.title, `%${q}%`),
            ilike(tierTemplates.description, `%${q}%`)
          )
        : undefined,
      category ? eq(tierTemplates.category, category) : undefined
    )

    const orderCol =
      sort === 'oldest'
        ? asc(tierTemplates.createdAt)
        : sort === 'a-z'
          ? asc(tierTemplates.title)
          : sort === 'popular'
            ? desc(likeCountExpr)
            : desc(tierTemplates.createdAt)

    const [rows, [countRow]] = await Promise.all([
      db
        .select({
          id: tierTemplates.id,
          slug: tierTemplates.slug,
          title: tierTemplates.title,
          category: tierTemplates.category,
          itemCount: sidebarItemCount,
          coverImageUrl: tierTemplates.coverImageUrl,
          createdAt: tierTemplates.createdAt,
          creatorName: user.name,
          creatorId: tierTemplates.creatorId,
          firstItemUrl: firstItemUrlExpr,
          likeCount: likeCountExpr,
        })
        .from(tierTemplates)
        .leftJoin(user, eq(tierTemplates.creatorId, user.id))
        .where(conditions)
        .orderBy(orderCol)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ count: count() }).from(tierTemplates).where(conditions),
    ])

    return {
      items: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category,
        itemCount: r.itemCount ?? 0,
        createdAt: r.createdAt,
        coverImageUrl: r.coverImageUrl ?? null,
        firstItemUrl: r.firstItemUrl ?? null,
        isPublic: true,
        creatorName: r.creatorName ?? null,
        creatorId: r.creatorId ?? null,
        likeCount: r.likeCount ?? 0,
      })),
      total: countRow?.count ?? 0,
    }
  },
  ['public-tier-lists'],
  { revalidate: 60, tags: [CACHE_TAGS.publicTierLists] }
)

export async function getTierListById(
  id: string,
  userId: string
): Promise<TierListDetail | null> {
  const [[tpl], rows] = await Promise.all([
    db
      .select()
      .from(tierTemplates)
      .where(
        and(eq(tierTemplates.id, id), eq(tierTemplates.creatorId, userId))
      ),
    db
      .select()
      .from(tierRows)
      .where(eq(tierRows.templateId, id))
      .orderBy(asc(tierRows.order)),
  ])

  if (!tpl) return null

  return {
    id: tpl.id,
    slug: tpl.slug,
    title: tpl.title,
    description: tpl.description,
    category: tpl.category,
    coverImageUrl: tpl.coverImageUrl ?? null,
    sidebarItems: tpl.sidebarItems,
    createdAt: tpl.createdAt,
    creatorId: tpl.creatorId ?? null,
    likeCount: 0,
    rows: rows.map((r) => ({
      id: r.id,
      label: r.label,
      color: r.color,
      order: r.order,
      items: r.items ?? [],
    })),
  }
}

export async function getAllPublicTierListIds(): Promise<
  { id: string; slug: string; createdAt: Date }[]
> {
  return db
    .select({
      id: tierTemplates.id,
      slug: tierTemplates.slug,
      createdAt: tierTemplates.createdAt,
    })
    .from(tierTemplates)
    .where(eq(tierTemplates.isPublic, true))
}

export async function getTemplateCreatorId(
  templateId: string
): Promise<string | null> {
  const [row] = await db
    .select({ creatorId: tierTemplates.creatorId })
    .from(tierTemplates)
    .where(eq(tierTemplates.id, templateId))
    .limit(1)
  return row?.creatorId ?? null
}
