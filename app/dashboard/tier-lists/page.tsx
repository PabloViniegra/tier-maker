import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ViewTransition } from 'react'
import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { getAllUserTierLists } from '@/lib/queries/tier-templates'
import {
  TierListGrid,
  TierListGridSkeleton,
} from '../_components/tier-list-grid'

export const metadata: Metadata = { title: 'My Tier Lists' }

export default function TierListsIndexPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-xl">My Tier Lists</h1>
        <Link
          href="/dashboard/tier-lists/new"
          className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
        >
          <Plus size={14} strokeWidth={1.5} />
          New Tier List
        </Link>
      </div>
      <ViewTransition>
        <Suspense fallback={<TierListsIndexSkeleton />}>
          <TierListsIndexContent />
        </Suspense>
      </ViewTransition>
    </div>
  )
}

async function TierListsIndexContent() {
  const session = await getSession()
  const userId = session!.user.id
  const tierLists = await getAllUserTierLists(userId)

  return (
    <div className="flex flex-col gap-3">
      {tierLists.length > 0 && (
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base">All</h2>
          <Badge variant="secondary" className="h-5 text-[10px] tabular-nums">
            {tierLists.length}
          </Badge>
        </div>
      )}
      <TierListGrid tierLists={tierLists} />
    </div>
  )
}

function TierListsIndexSkeleton() {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="font-heading text-base text-transparent select-none">
          All
        </div>
      </div>
      <TierListGridSkeleton />
    </>
  )
}
