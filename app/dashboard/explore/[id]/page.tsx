import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicTierListById } from '@/lib/queries/tier-templates'
import { getSession } from '@/lib/session'
import { getIsLiked } from '@/lib/queries/tier-likes'
import { PublicTierFill } from '@/app/explore/_components/public-tier-fill'

const getPublicTierList = cache(getPublicTierListById)

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getPublicTierList(id)
  if (!data) return { title: 'Tier List Not Found' }
  return {
    title: `${data.title} — Tier Maker`,
    description:
      data.description ??
      `Fill the ${data.title} tier list from the community.`,
  }
}

export default async function DashboardExploreTierFillPage({ params }: Props) {
  const { id } = await params
  const [data, session] = await Promise.all([
    getPublicTierList(id),
    getSession(),
  ])

  if (!data) notFound()

  const userId = session?.user.id ?? null
  const isLiked = userId ? await getIsLiked(userId, data.id) : false
  const isOwner = userId !== null && data.creatorId === userId

  return (
    <PublicTierFill
      tierId={id}
      userId={userId}
      backHref="/dashboard/explore"
      shareUrl={`/dashboard/explore/${id}`}
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
  )
}
