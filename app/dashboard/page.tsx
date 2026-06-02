import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import {
  getUserTierListStats,
  getRecentTierLists,
} from '@/lib/queries/tier-templates'
import { StatsCards } from './_components/stats-cards'
import { TierListGrid } from './_components/tier-list-grid'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session!.user.id

  const [stats, tierLists] = await Promise.all([
    getUserTierListStats(userId),
    getRecentTierLists(userId),
  ])

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-heading text-xl">Dashboard</h1>

      <StatsCards stats={stats} />

      <div className="flex flex-col gap-3">
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
        <TierListGrid tierLists={tierLists} />
      </div>
    </div>
  )
}
