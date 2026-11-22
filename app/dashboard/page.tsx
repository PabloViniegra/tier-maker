import { Suspense } from 'react'
import { ViewTransition } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { getSession } from '@/lib/session'
import {
  getUserTierListStats,
  getRecentTierLists,
  getLatestTierBoardPreview,
} from '@/lib/queries/tier-templates'
import { FadeUp } from '@/components/ui/fade-up'
import { StatsCards, StatsCardsSkeleton } from './_components/stats-cards'
import {
  TierListGrid,
  TierListGridSkeleton,
} from './_components/tier-list-grid'
import {
  LatestTierBoard,
  LatestTierBoardSkeleton,
} from './_components/latest-tier-board'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex flex-col gap-6 p-6">
      <FadeUp delay={0} onMount>
        <h1 className="font-heading text-[2rem] leading-tight">Dashboard</h1>
      </FadeUp>
      <ViewTransition>
        <Suspense fallback={<DashboardContentSkeleton />}>
          <DashboardContent userId={session.user.id} />
        </Suspense>
      </ViewTransition>
    </div>
  )
}

async function DashboardContent({ userId }: { userId: string }) {
  const [stats, tierLists, board] = await Promise.all([
    getUserTierListStats(userId),
    getRecentTierLists(userId),
    getLatestTierBoardPreview(userId),
  ])
  const featured =
    board && tierLists[0]?.id === board.templateId ? tierLists[0] : null
  const rest = featured ? tierLists.slice(1) : tierLists

  return (
    <>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_17rem]">
        {featured && board ? (
          <LatestTierBoard tierList={featured} board={board} />
        ) : (
          tierLists.length === 0 && <TierListGrid tierLists={[]} />
        )}
        <StatsCards stats={stats} />
      </div>
      {tierLists.length > 0 && (
        <div className="flex flex-col gap-3">
          <FadeUp delay={0.06} onMount>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-base">Recent Tier Lists</h2>
              {stats.total > 0 && (
                <Badge variant="secondary" className="h-5 text-xs tabular-nums">
                  {stats.total}
                </Badge>
              )}
              {stats.total > tierLists.length && (
                <Link
                  href="/dashboard/tier-lists"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'h-5 px-2 text-xs'
                  )}
                >
                  View All
                </Link>
              )}
              <Link
                href="/dashboard/tier-lists/new"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'ml-auto gap-1.5'
                )}
              >
                <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
                New Tier List
              </Link>
            </div>
          </FadeUp>
          {rest.length > 0 && <TierListGrid tierLists={rest} />}
        </div>
      )}
    </>
  )
}

function DashboardContentSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <LatestTierBoardSkeleton />
        <StatsCardsSkeleton />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="font-heading text-base text-transparent select-none"
          >
            Recent Tier Lists
          </div>
        </div>
        <TierListGridSkeleton />
      </div>
    </>
  )
}
