import { Suspense } from 'react'
import { ViewTransition } from 'react'
import type { Metadata } from 'next'

import { Badge } from '@/components/ui/badge'
import { getSession } from '@/lib/session'
import {
  getUserTierListStats,
  getRecentTierLists,
} from '@/lib/queries/tier-templates'
import { FadeUp } from '@/components/ui/fade-up'
import { StatsCards, StatsCardsSkeleton } from './_components/stats-cards'
import {
  TierListGrid,
  TierListGridSkeleton,
} from './_components/tier-list-grid'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <FadeUp delay={0} onMount>
        <h1 className="font-heading text-xl">Dashboard</h1>
      </FadeUp>
      <ViewTransition>
        <Suspense fallback={<DashboardContentSkeleton />}>
          <DashboardContent />
        </Suspense>
      </ViewTransition>
    </div>
  )
}

async function DashboardContent() {
  const session = await getSession()
  const userId = session!.user.id

  const [stats, tierLists] = await Promise.all([
    getUserTierListStats(userId),
    getRecentTierLists(userId),
  ])

  return (
    <>
      <StatsCards stats={stats} />
      <div className="flex flex-col gap-3">
        <FadeUp delay={0.06} onMount>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base">Recent Tier Lists</h2>
            {stats.total > 0 && (
              <Badge
                variant="secondary"
                className="h-5 text-[10px] tabular-nums"
              >
                {stats.total}
              </Badge>
            )}
          </div>
        </FadeUp>
        <TierListGrid tierLists={tierLists} />
      </div>
    </>
  )
}

function DashboardContentSkeleton() {
  return (
    <>
      <StatsCardsSkeleton />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="font-heading text-base text-transparent select-none">
            Recent Tier Lists
          </div>
        </div>
        <TierListGridSkeleton />
      </div>
    </>
  )
}
