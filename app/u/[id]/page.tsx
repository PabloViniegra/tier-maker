import { ViewTransition } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import {
  getPublicCreatorProfile,
  getPublicTierLists,
} from '@/lib/queries/tier-templates'
import { getUserLikedTemplateIds } from '@/lib/queries/tier-likes'
import { DEFAULT_SORT, PAGE_SIZE } from '@/lib/explore-params'
import { getInitials } from '@/lib/utils/cover-placeholder'
import { FadeUp } from '@/components/ui/fade-up'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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

  if (!profile || page > Math.ceil(profile.listCount / PAGE_SIZE)) notFound()

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
        <div className="mx-auto w-full max-w-6xl px-4 pt-3">
          <Link
            href="/explore"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              '-ml-2 gap-1.5 text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Explore
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 pt-3 pb-6">
          <FadeUp delay={0} onMount>
            <div
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-heading text-lg font-semibold text-foreground select-none"
            >
              {getInitials(profile.name)}
            </div>
          </FadeUp>
          <div className="min-w-0">
            <FadeUp delay={0.06} onMount>
              <h1 className="line-clamp-2 font-heading text-[2rem] leading-tight font-semibold text-balance break-words text-foreground">
                {profile.name}
              </h1>
            </FadeUp>
            <FadeUp delay={0.12} onMount>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <p className="text-sm text-muted-foreground tabular-nums">
                  {profile.listCount} public tier list
                  {profile.listCount === 1 ? '' : 's'} · {profile.likeCount}{' '}
                  {profile.likeCount === 1 ? 'like' : 'likes'}
                </p>
                {profile.topCategories.length > 0 && (
                  <ul
                    aria-label="Top categories"
                    className="flex flex-wrap gap-1.5"
                  >
                    {profile.topCategories.map((category) => (
                      <li key={category}>
                        <Badge
                          variant="secondary"
                          className="h-5 max-w-[120px] truncate rounded-sm text-xs"
                        >
                          {category}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
            hideCreator
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
