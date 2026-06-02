import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getSession } from '@/lib/session'
import { getCategoryPresets } from './actions'
import { getUserCategoryPresets } from '@/lib/queries/user-category-presets'
import { TierListCreator } from './_components/tier-list-creator'

export const metadata: Metadata = { title: 'New Tier List' }

export default async function NewTierListPage() {
  const session = await getSession()
  const [presets, userPresets] = await Promise.all([
    getCategoryPresets(),
    session ? getUserCategoryPresets(session.user.id) : Promise.resolve([]),
  ])

  return (
    <div className='flex flex-col gap-6 p-6'>
      <Suspense fallback={null}>
        <TierListCreator categoryPresets={presets} userCategoryPresets={userPresets} />
      </Suspense>
    </div>
  )
}
