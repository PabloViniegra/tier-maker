import { Layers } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Sparkline } from '@/components/sparkline'
import type { ProfileStats } from '@/lib/queries/tier-templates'

export function ProfileActivity({ stats }: { stats: ProfileStats }) {
  if (stats.created === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No lists yet"
        description="Create your first tier list to start ranking things."
        cta={{
          label: 'Create Tier List',
          href: '/dashboard/tier-lists/new',
        }}
      />
    )
  }

  const cards = [
    {
      label: 'Created',
      value: stats.created,
      series: stats.createdSeries,
    },
    {
      label: 'Published',
      value: stats.published,
      series: stats.publishedSeries,
    },
    {
      label: 'Likes',
      value: stats.likesReceived,
      series: null,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-base">Your lists</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map(({ label, value, series }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="font-mono text-3xl font-semibold text-foreground tabular-nums">
                {value}
              </p>
              {series && series.some((n) => n > 0) && (
                <Sparkline series={series} width={72} height={28} />
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Sparklines show the last 14 days. Totals are all-time.
      </p>
    </div>
  )
}
