import { cache, ViewTransition } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { getPublicTierListById } from '@/lib/queries/tier-templates'
import { getIsLiked } from '@/lib/queries/tier-likes'
import { LikeButton } from '@/components/like-button'
import { ExploreHeader } from '../_components/explore-header'
import { AnonymousCTABanner } from '../_components/anonymous-cta-banner'
import { PublicTierFill } from '../_components/public-tier-fill'

const getPublicTierList = cache(getPublicTierListById)

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getPublicTierList(id)
  if (!data) return { title: 'Tier List Not Found' }
  const description = data.description ?? `Fill the ${data.title} tier list from the community.`
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
  const { id } = await params
  const [session, data] = await Promise.all([getSession(), getPublicTierList(id)])

  if (!data) notFound()

  const userId = session?.user.id ?? null
  const isLiked = userId ? await getIsLiked(userId, id) : false
  const isOwner = userId !== null && data.creatorId === userId

  return (
    <div className="flex h-screen flex-col bg-background">
      <ExploreHeader isLoggedIn={!!session} />
      {!session && <AnonymousCTABanner />}

      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
        <h1 className="truncate text-sm font-medium text-foreground">{data.title}</h1>
        {!isOwner && (
          <LikeButton
            templateId={id}
            initialCount={data.likeCount}
            initialIsLiked={isLiked}
            isAuthenticated={!!session}
          />
        )}
      </div>

      <main id="main-content" className="flex-1 overflow-hidden">
        <ViewTransition name={`tier-cover-${id}`}>
          <PublicTierFill
            tierId={id}
            data={{
              title: data.title,
              description: data.description,
              category: data.category,
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
