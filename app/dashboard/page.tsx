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
} from '@/lib/queries/tier-templates'
import { FadeUp } from '@/components/ui/fade-up'
import { StatsCards, StatsCardsSkeleton } from './_components/stats-cards'
import {
  TierListGrid,
  TierListGridSkeleton,
} from './_components/tier-list-grid'

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
  const [stats, tierLists] = await Promise.all([
    getUserTierListStats(userId),
    getRecentTierLists(userId),
  ])

  return (
    <>
      <StatsCards stats={stats} />
      <div className="flex flex-col gap-3">
        <FadeUp delay={0.06} onMount>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-base">Recent Tier Lists</h2>
            {stats.total > 0 && (
              <Badge
                variant="secondary"
                className="h-5 text-xs tabular-nums"
              >
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
                View all
              </Link>
            )}
            <Link
              href="/dashboard/tier-lists/new"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'ml-auto gap-1.5'
              )}
            >
              <Plus size={14} strokeWidth={1.5} />
              New Tier List
            </Link>
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
