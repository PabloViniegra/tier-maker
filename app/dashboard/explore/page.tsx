import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getPublicTierLists,
  getDistinctPublicCategories,
} from '@/lib/queries/tier-templates'
import { PAGE_SIZE, toSort } from '@/lib/explore-params'
import { getSession } from '@/lib/session'
import { getUserLikedTemplateIds } from '@/lib/queries/tier-likes'
import { FadeUp } from '@/components/ui/fade-up'
import { ExploreSearchInput } from '@/app/explore/_components/explore-search-input'
import { ExploreCategoryFilter } from '@/app/explore/_components/explore-category-filter'
import { ExploreSortSelect } from '@/app/explore/_components/explore-sort-select'
import { ExploreGrid } from '@/app/explore/_components/explore-grid'
import { ExplorePagination } from '@/app/explore/_components/explore-pagination'

export const metadata: Metadata = {
  title: 'Explore — Tier Maker',
}

type Props = {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    page?: string
  }>
}

export default async function DashboardExplorePage({ searchParams }: Props) {
  const sp = await searchParams
  const q = sp.q ?? ''
  const category = sp.category ?? ''
  const sort = toSort(sp.sort)
  const rawPage = parseInt(sp.page ?? '1', 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  const [session, { items, total }, categories] = await Promise.all([
    getSession(),
    getPublicTierLists({ q, category, sort, page, pageSize: PAGE_SIZE }),
    getDistinctPublicCategories(),
  ])

  const userId = session?.user.id ?? null
  const likedIds = userId
    ? await getUserLikedTemplateIds(
        userId,
        items.map((i) => i.id)
      )
    : []

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <FadeUp delay={0} onMount>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Explore Tier Lists
          </h1>
        </FadeUp>
        <FadeUp delay={0.06} onMount>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? `${total} public tier list${total === 1 ? '' : 's'} from the community`
              : 'No tier lists found'}
          </p>
        </FadeUp>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <FadeUp delay={0.12} onMount>
          <Suspense
            fallback={
              <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-surface" />
            }
          >
            <ExploreSearchInput defaultValue={q} />
          </Suspense>
        </FadeUp>
        <FadeUp delay={0.18} onMount>
          <Suspense
            fallback={
              <div className="h-8 w-[160px] animate-pulse rounded-md bg-surface" />
            }
          >
            <ExploreCategoryFilter categories={categories} value={category} />
          </Suspense>
        </FadeUp>
        <FadeUp delay={0.24} onMount>
          <Suspense
            fallback={
              <div className="h-8 w-[150px] animate-pulse rounded-md bg-surface" />
            }
          >
            <ExploreSortSelect value={sort} />
          </Suspense>
        </FadeUp>
      </div>

      <ExploreGrid
        items={items}
        q={q}
        category={category}
        sort={sort}
        likedIds={likedIds}
        currentUserId={userId}
        isAuthenticated={!!session}
      />

      <ExplorePagination
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        searchParams={{ q, category, sort }}
      />
    </div>
  )
}
