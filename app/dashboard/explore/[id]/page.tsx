import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicTierListById } from '@/lib/queries/tier-templates'
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
    description: data.description ?? `Fill the ${data.title} tier list from the community.`,
  }
}

export default async function DashboardExploreTierFillPage({ params }: Props) {
  const { id } = await params
  const data = await getPublicTierList(id)

  if (!data) notFound()

  return (
    <PublicTierFill
      backHref="/dashboard/explore"
      data={{
        title: data.title,
        description: data.description,
        category: data.category,
        sidebarItems: data.sidebarItems,
        rows: data.rows,
      }}
    />
  )
}
