import { formatRelativeDate } from '@/lib/utils/format-date'
import { Skeleton } from '@/components/ui/skeleton'

type Stats = {
  total: number
  categories: number
  lastActivity: Date | null
}

const statDefs = [
  {
    label: 'Tier Lists',
    sublabel: 'total created',
    key: 'total' as const,
  },
  {
    label: 'Categories',
    sublabel: 'distinct',
    key: 'categories' as const,
  },
  {
    label: 'Last Active',
    sublabel: null,
    key: 'lastActivity' as const,
  },
]

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4">
          <Skeleton className="mb-2 h-3 w-16" />
          <Skeleton className="mb-1.5 h-7 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function StatsCards({ stats }: { stats: Stats }) {
  const values = {
    total: String(stats.total),
    categories: String(stats.categories),
    lastActivity: formatRelativeDate(stats.lastActivity),
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
      {statDefs.map(({ label, sublabel, key }, i) => (
        <div
          key={key}
          className="animate-fade-in-up rounded-lg border border-border bg-surface p-4"
          style={{ '--delay': `${i * 80}ms` } as React.CSSProperties}
        >
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-foreground tabular-nums">
            {values[key]}
          </p>
          {sublabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
      ))}
    </div>
  )
}
