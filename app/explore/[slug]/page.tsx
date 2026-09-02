import { cache, ViewTransition } from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import {
  getPublicTierListBySlug,
  getPublicTierListById,
} from '@/lib/queries/tier-templates'
import { getIsLiked } from '@/lib/queries/tier-likes'
import { ExploreHeader } from '../_components/explore-header'
import { AnonymousCTABanner } from '../_components/anonymous-cta-banner'
import { PublicTierFill } from '../_components/public-tier-fill'

const getPublicTierList = cache(getPublicTierListBySlug)

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(value: string) {
  return UUID_RE.test(value)
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getPublicTierList(slug)
  if (!data) return { title: 'Tier List Not Found' }
  const description =
    data.description ?? `Fill the ${data.title} tier list from the community.`
  return {
    title: data.title,
    description,
    openGraph: {
      type: 'article',
      title: `${data.title} — Tier Maker`,
      description,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} — Tier Maker`,
      description,
      images: ['/og.png'],
    },
  }
}

export default async function PublicTierFillPage({ params }: Props) {
  const { slug } = await params

  // Legacy redirect: old UUID-based URLs are permanent-redirected (301) to the
  // new slug-based canonical URL.
  if (isUuid(slug)) {
    const data = await getPublicTierListById(slug)
    if (!data) notFound()
    permanentRedirect(`/explore/${data.slug}`)
  }

  const [session, data] = await Promise.all([
    getSession(),
    getPublicTierList(slug),
  ])

  if (!data) notFound()

  const userId = session?.user.id ?? null
  const isLiked = userId ? await getIsLiked(userId, data.id) : false
  const isOwner = userId !== null && data.creatorId === userId

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ExploreHeader isLoggedIn={!!session} isDetail />
      {!session && <AnonymousCTABanner />}

      <main id="main-content" className="min-h-0 flex-1 overflow-hidden">
        <ViewTransition name={`tier-cover-${data.id}`}>
          <PublicTierFill
            tierId={data.id}
            userId={userId}
            like={
              isOwner
                ? undefined
                : {
                    templateId: data.id,
                    initialCount: data.likeCount,
                    initialIsLiked: isLiked,
                    isAuthenticated: !!session,
                  }
            }
            data={{
              title: data.title,
              description: data.description,
              category: data.category,
              creatorName: data.creatorName,
              coverImageUrl: data.coverImageUrl,
              sidebarItems: data.sidebarItems,
              rows: data.rows,
            }}
          />
        </ViewTransition>
      </main>
    </div>
  )
}
