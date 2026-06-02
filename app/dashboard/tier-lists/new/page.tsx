import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getSession } from '@/lib/session'
import { getCategoryPresets } from './actions'
import { TierListCreator } from './_components/tier-list-creator'

export const metadata: Metadata = { title: 'New Tier List' }

export default async function NewTierListPage() {
  await getSession()
  const presets = await getCategoryPresets()

  return (
    <div className='flex flex-col gap-6 p-6'>
      <Suspense fallback={null}>
        <TierListCreator categoryPresets={presets} />
      </Suspense>
    </div>
  )
}
