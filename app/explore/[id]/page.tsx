import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { getPublicTierListById } from '@/lib/queries/tier-templates'

// Deduplicate DB call between generateMetadata and the page function
const getPublicTierList = cache(getPublicTierListById)
import { ExploreHeader } from '../_components/explore-header'
import { AnonymousCTABanner } from '../_components/anonymous-cta-banner'
import { PublicTierFill } from '../_components/public-tier-fill'

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

  return (
    <div className="flex h-screen flex-col bg-background">
      <ExploreHeader isLoggedIn={!!session} />
      {!session && <AnonymousCTABanner />}
      <main id="main-content" className="flex-1 overflow-hidden">
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
      </main>
    </div>
  )
}
