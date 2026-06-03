import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import {
  getPublicTierLists,
  getDistinctPublicCategories,
  type ExploreSort,
} from '@/lib/queries/tier-templates'

const VALID_SORTS = new Set<ExploreSort>(['newest', 'oldest', 'a-z'])
function toSort(raw: string | undefined): ExploreSort {
  return VALID_SORTS.has(raw as ExploreSort) ? (raw as ExploreSort) : 'newest'
}
import { ExploreHeader } from './_components/explore-header'
import { ExploreSearchInput } from './_components/explore-search-input'
import { ExploreCategoryFilter } from './_components/explore-category-filter'
import { ExploreSortSelect } from './_components/explore-sort-select'
import { ExploreGrid } from './_components/explore-grid'
import { ExplorePagination } from './_components/explore-pagination'

export const metadata: Metadata = {
  title: 'Explore Tier Lists — Tier Maker',
  description: 'Browse and fill community-created tier lists. No account required.',
}

const PAGE_SIZE = 12

type Props = {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    page?: string
  }>
}

export default async function ExplorePage({ searchParams }: Props) {
  const sp = await searchParams
  const q = sp.q ?? ''
  const category = sp.category ?? ''
  const sort = toSort(sp.sort)
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const [session, { items, total }, categories] = await Promise.all([
    getSession(),
    getPublicTierLists({ q, category, sort, page, pageSize: PAGE_SIZE }),
    getDistinctPublicCategories(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ExploreHeader isLoggedIn={!!session} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Explore Tier Lists
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? `${total} public tier list${total === 1 ? '' : 's'} from the community`
              : 'No tier lists found'}
          </p>
        </div>

        {/* Filters — each uses useSearchParams, must be inside Suspense */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Suspense fallback={<div className="h-9 w-full max-w-md rounded-md bg-surface animate-pulse" />}>
            <ExploreSearchInput defaultValue={q} />
          </Suspense>
          <Suspense fallback={<div className="h-8 w-[160px] rounded-md bg-surface animate-pulse" />}>
            <ExploreCategoryFilter categories={categories} value={category} />
          </Suspense>
          <Suspense fallback={<div className="h-8 w-[150px] rounded-md bg-surface animate-pulse" />}>
            <ExploreSortSelect value={sort} />
          </Suspense>
        </div>

        <ExploreGrid items={items} />

        <ExplorePagination
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          searchParams={{ q, category, sort }}
        />
      </main>
    </div>
  )
}
