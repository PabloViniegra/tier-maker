import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ViewTransition } from 'react'
import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { getAllUserTierLists } from '@/lib/queries/tier-templates'
import {
  TierListsBrowser,
} from './_components/tier-lists-browser'
import { TierListGridSkeleton } from '../_components/tier-list-grid'

export const metadata: Metadata = { title: 'My Tier Lists' }

export default function TierListsIndexPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-[2rem] leading-tight">My Tier Lists</h1>
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

export async function TierListsIndexContent() {
  const session = await getSession()
  if (!session) redirect('/login')

  const tierLists = await getAllUserTierLists(session.user.id)

  return (
    <div className="flex flex-col gap-3">
      {tierLists.length > 0 && (
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base">All</h2>
          <Badge variant="secondary" className="h-5 text-xs tabular-nums">
            {tierLists.length}
          </Badge>
        </div>
      )}
      <TierListsBrowser tierLists={tierLists} />
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
