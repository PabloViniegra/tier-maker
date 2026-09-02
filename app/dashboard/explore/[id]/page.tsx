import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicTierListById } from '@/lib/queries/tier-templates'
import { getSession } from '@/lib/session'
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

  return (
    <PublicTierFill
      tierId={id}
      userId={session?.user.id ?? null}
      backHref="/dashboard/explore"
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
