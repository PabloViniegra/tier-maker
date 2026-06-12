'use client'

import { motion } from 'motion/react'
import { LayoutList, Tag, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils/format-date'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkline } from '@/components/sparkline'
import { formatDelta } from '@/lib/utils/delta'
import { fadeUpVariants, STAGGER_DELAY } from '@/lib/motion-variants'
import type { TierListStats } from '@/lib/queries/tier-templates'

type DisplayKey = 'total' | 'categories' | 'lastActivity'

type StatsCardDef = {
  key: DisplayKey
  label: string
  sublabel: string | null
  icon: LucideIcon
}

const statDefs: StatsCardDef[] = [
  {
    label: 'Tier Lists',
    sublabel: 'total created',
    key: 'total',
    icon: LayoutList,
  },
  {
    label: 'Categories',
    sublabel: 'distinct',
    key: 'categories',
    icon: Tag,
  },
  {
    label: 'Last Active',
    sublabel: null,
    key: 'lastActivity',
    icon: Clock,
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

export function StatsCards({ stats }: { stats: TierListStats }) {
  const displayValues: Record<DisplayKey, string> = {
    total: String(stats.total),
    categories: String(stats.categories),
    lastActivity: formatRelativeDate(stats.lastActivity),
  }

  // Deltas compare current-window vs previous-window counts — not all-time totals
  const totalDelta = formatDelta(stats.totalCurrent, stats.totalPrev)
  const categoriesDelta = formatDelta(
    stats.categoriesCurrent,
    stats.categoriesPrev
  )

  return (
    <motion.div
      className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr]"
      initial="hidden"
      animate="visible"
    >
      {statDefs.map(({ label, sublabel, key, icon: Icon }, i) => {
        const hasSeries = key === 'total'
        const delta =
          key === 'total'
            ? totalDelta
            : key === 'categories'
              ? categoriesDelta
              : null

        return (
          <motion.div
            key={key}
            variants={fadeUpVariants}
            custom={i * STAGGER_DELAY}
            className="rounded-lg border border-border bg-surface p-4"
          >
            {/* Header row: label + icon */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon
                size={12}
                strokeWidth={1.5}
                className="text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            {/* Value + sparkline row */}
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">
                {displayValues[key]}
              </p>
              {hasSeries && stats.totalSeries.length > 0 && (
                <Sparkline series={stats.totalSeries} width={64} height={24} />
              )}
            </div>

            {/* Footer row: sublabel + delta */}
            <div className="mt-0.5 flex items-center gap-2">
              {sublabel && (
                <p className="text-xs text-muted-foreground">{sublabel}</p>
              )}
              {delta && (
                <p
                  className={[
                    'text-xs tabular-nums',
                    delta.direction === 'positive'
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  ].join(' ')}
                  title="vs previous 14 days"
                >
                  {delta.formatted}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
