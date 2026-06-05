import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/session'
import { getTierListById } from '@/lib/queries/tier-templates'
import { getCategoryPresets } from '@/lib/queries/category-presets'
import { getUserCategoryPresets } from '@/lib/queries/user-category-presets'
import { TierListCreator } from '../../new/_components/tier-list-creator'

export const metadata: Metadata = { title: 'Edit Tier List' }

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditTierListPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()
  if (!session) notFound()

  const [data, presets, userPresets] = await Promise.all([
    getTierListById(id, session.user.id),
    getCategoryPresets(),
    getUserCategoryPresets(session.user.id),
  ])

  if (!data) notFound()

  return (
    <div className='flex flex-col gap-6 p-6'>
      <Suspense fallback={null}>
        <TierListCreator
          categoryPresets={presets}
          userCategoryPresets={userPresets}
          initialData={{
            title: data.title,
            description: data.description,
            category: data.category,
            coverImageUrl: data.coverImageUrl,
            sidebarItems: data.sidebarItems,
            rows: data.rows,
          }}
          editId={id}
        />
      </Suspense>
    </div>
  )
}
