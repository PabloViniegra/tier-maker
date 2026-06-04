import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getPublicTierLists,
  getDistinctPublicCategories,
} from '@/lib/queries/tier-templates'
import { PAGE_SIZE, toSort } from '@/lib/explore-params'
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
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const [{ items, total }, categories] = await Promise.all([
    getPublicTierLists({ q, category, sort, page, pageSize: PAGE_SIZE }),
    getDistinctPublicCategories(),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
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
    </div>
  )
}
