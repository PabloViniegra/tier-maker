import { ViewTransition } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import {
  getPublicCreatorProfile,
  getPublicTierLists,
} from '@/lib/queries/tier-templates'
import { getUserLikedTemplateIds } from '@/lib/queries/tier-likes'
import { DEFAULT_SORT, PAGE_SIZE } from '@/lib/explore-params'
import { getCategoryGradient, getInitials } from '@/lib/utils/cover-placeholder'
import { FadeUp } from '@/components/ui/fade-up'
import { ExploreHeader } from '@/app/explore/_components/explore-header'
import { ExploreGrid } from '@/app/explore/_components/explore-grid'
import { ExplorePagination } from '@/app/explore/_components/explore-pagination'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const profile = await getPublicCreatorProfile(id)
  if (!profile) return { title: 'Profile Not Found' }
  const title = `${profile.name}'s tier lists`
  const description = `Browse and fill the public tier lists created by ${profile.name}.`
  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      title: `${title} — Tier Maker`,
      description,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Tier Maker`,
      description,
      images: ['/opengraph-image'],
    },
  }
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const rawPage = parseInt(sp.page ?? '1', 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  const [session, profile, { items }] = await Promise.all([
    getSession(),
    getPublicCreatorProfile(id),
    getPublicTierLists({
      creatorId: id,
      sort: DEFAULT_SORT,
      page,
      pageSize: PAGE_SIZE,
    }),
  ])

  if (!profile) notFound()

  const userId = session?.user.id ?? null
  const likedIds = userId
    ? await getUserLikedTemplateIds(
        userId,
        items.map((i) => i.id)
      )
    : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ExploreHeader isLoggedIn={!!session} />

      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-6">
          <FadeUp delay={0} onMount>
            <div
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold text-white select-none"
              style={{ background: getCategoryGradient(profile.id) }}
            >
              {getInitials(profile.name)}
            </div>
          </FadeUp>
          <div className="min-w-0">
            <FadeUp delay={0.06} onMount>
              <h1 className="truncate font-heading text-2xl font-semibold text-foreground">
                {profile.name}
              </h1>
            </FadeUp>
            <FadeUp delay={0.12} onMount>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {profile.listCount} public tier list
                {profile.listCount === 1 ? '' : 's'} · {profile.likeCount}{' '}
                {profile.likeCount === 1 ? 'like' : 'likes'}
              </p>
            </FadeUp>
          </div>
        </div>
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8"
      >
        <ViewTransition>
          <ExploreGrid
            items={items}
            q=""
            category=""
            sort={DEFAULT_SORT}
            likedIds={likedIds}
            currentUserId={userId}
            isAuthenticated={!!session}
          />

          <ExplorePagination
            total={profile.listCount}
            page={page}
            pageSize={PAGE_SIZE}
            searchParams={{}}
          />
        </ViewTransition>
      </main>
    </div>
  )
}
