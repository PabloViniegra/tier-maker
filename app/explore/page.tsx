import { Suspense, ViewTransition } from 'react'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import {
  getPublicTierLists,
  getDistinctPublicCategories,
} from '@/lib/queries/tier-templates'

import { PAGE_SIZE, toSort } from '@/lib/explore-params'
import { FadeUp } from '@/components/ui/fade-up'
import { Skeleton } from '@/components/ui/skeleton'
import { ExploreHeader } from './_components/explore-header'
import { ExploreSearchInput } from './_components/explore-search-input'
import { ExploreCategoryFilter } from './_components/explore-category-filter'
import { ExploreSortSelect } from './_components/explore-sort-select'
import { ExploreGrid } from './_components/explore-grid'
import { ExploreGridSkeleton } from './_components/explore-grid-skeleton'
import { ExplorePagination } from './_components/explore-pagination'

export const metadata: Metadata = {
  title: 'Explore Tier Lists',
  description: 'Browse and fill community-created tier lists. No account required.',
  openGraph: {
    title: 'Explore Tier Lists — Tier Maker',
    description: 'Browse and fill community-created tier lists. No account required.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Tier Maker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Tier Lists — Tier Maker',
    description: 'Browse and fill community-created tier lists. No account required.',
    images: ['/og.png'],
  },
}

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
  const rawPage = parseInt(sp.page ?? '1', 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  const [session, { items, total }, categories] = await Promise.all([
    getSession(),
    getPublicTierLists({ q, category, sort, page, pageSize: PAGE_SIZE }),
    getDistinctPublicCategories(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ExploreHeader isLoggedIn={!!session} />

      {/* Hero band — title, subtitle, and filter bar in a single surface strip */}
      <div className="relative overflow-hidden border-b border-border bg-surface">
        {/* Subtle radial blue accent — same family as auth layout, lower opacity */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,oklch(0.62_0.22_250/0.08)_0%,transparent_60%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-6">
          <FadeUp delay={0} onMount>
            <h1 className="font-heading text-2xl font-semibold text-foreground text-balance">
              Explore Tier Lists
            </h1>
          </FadeUp>
          <FadeUp delay={0.06} onMount>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {total > 0
                ? `${total} public tier list${total === 1 ? '' : 's'} from the community`
                : 'No tier lists found'}
            </p>
          </FadeUp>

          {/* Filters — FadeUp wraps Suspense so skeleton is visible during fade-in */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <FadeUp delay={0.12} onMount>
              <Suspense fallback={<Skeleton className="h-9 w-full max-w-md" />}>
                <ExploreSearchInput defaultValue={q} />
              </Suspense>
            </FadeUp>
            <FadeUp delay={0.18} onMount>
              <Suspense fallback={<Skeleton className="h-8 w-[160px]" />}>
                <ExploreCategoryFilter categories={categories} value={category} />
              </Suspense>
            </FadeUp>
            <FadeUp delay={0.24} onMount>
              <Suspense fallback={<Skeleton className="h-8 w-[150px]" />}>
                <ExploreSortSelect value={sort} />
              </Suspense>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* Grid section */}
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8">
        <ViewTransition>
          <Suspense fallback={<ExploreGridSkeleton />}>
            <ExploreGrid items={items} q={q} category={category} sort={sort} />
          </Suspense>

          <ExplorePagination
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchParams={{ q, category, sort }}
          />
        </ViewTransition>
      </main>
    </div>
  )
}
