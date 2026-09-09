import { Sparkline } from '@/components/sparkline'
import type { ProfileStats } from '@/lib/queries/tier-templates'

export function ProfileActivity({ stats }: { stats: ProfileStats }) {
  if (stats.created === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        No lists yet
      </p>
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map(({ label, value, series }) => (
        <div
          key={label}
          className="rounded-lg border border-border bg-surface p-4"
        >
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">
              {value}
            </p>
            {series && series.some((n) => n > 0) && (
              <Sparkline series={series} width={64} height={24} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
