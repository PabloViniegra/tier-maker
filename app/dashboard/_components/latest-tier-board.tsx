'use client'

import { ViewTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RelativeDate } from '@/components/relative-date'
import { cn } from '@/lib/utils'
import { tierBoardTransitionName } from '@/lib/utils/view-transitions'
import {
  fadeUpVariants,
  tierChipStampVariants,
  tierDistributionVariants,
  tierItemDelay,
  tierItemDropVariants,
  staggerIndex,
  STAGGER_DELAY,
} from '@/lib/motion-variants'
import type { TierBoardPreview } from '@/lib/queries/tier-templates'
import type { ImageItem } from '@/lib/validators/tier-list'
import type { TierListCardProps } from './tier-list-card'

const MAX_ROWS = 6

export function LatestTierBoard({
  tierList,
  board: { rows, bank, bankCount },
}: {
  tierList: TierListCardProps
  board: TierBoardPreview
}) {
  const fillHref = `/dashboard/tier-lists/${tierList.id}`
  const visibleRows = rows.slice(0, MAX_ROWS)
  const hiddenRows = rows.length - visibleRows.length
  const ranked = rows.reduce((sum, r) => sum + r.itemCount, 0)
  const total = ranked + bankCount
  const distributionDelay = tierItemDelay(visibleRows.length, 0) + STAGGER_DELAY

  return (
    <motion.section
      aria-labelledby="latest-tier-board-title"
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={0}
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-foreground/15 sm:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2
            id="latest-tier-board-title"
            className="font-heading text-xl leading-tight text-balance break-words"
          >
            {tierList.title}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge
              variant="secondary"
              className="h-5 max-w-[160px] truncate text-xs"
            >
              {tierList.category}
            </Badge>
            {!tierList.isPublic && (
              <Badge
                variant="secondary"
                className="h-5 text-xs text-muted-foreground"
              >
                Private
              </Badge>
            )}
            <span>
              Created <RelativeDate date={tierList.createdAt} />
            </span>
          </div>
        </div>
        <Link
          href={fillHref}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'gap-1.5'
          )}
        >
          {bankCount > 0 && ranked > 0
            ? 'Continue ranking'
            : ranked === 0
              ? 'Start ranking'
              : 'Open tier list'}
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </header>

      <ViewTransition
        name={tierBoardTransitionName(tierList.id)}
        share="board-morph"
        default="none"
      >
        <Link
          href={fillHref}
          tabIndex={-1}
          aria-hidden="true"
          className="group/board flex flex-col gap-1"
        >
          {visibleRows.map((row, rowIndex) => (
            <div key={row.id} className="flex items-stretch gap-1">
              <motion.div
                variants={tierChipStampVariants}
                initial="hidden"
                animate="visible"
                custom={staggerIndex(rowIndex) * STAGGER_DELAY}
                className="flex h-11 w-14 shrink-0 items-center justify-center rounded-[3px] font-heading text-xs font-bold text-white sm:h-12 sm:w-16"
                style={{ background: row.color }}
              >
                <span className="line-clamp-2 px-1 text-center leading-tight hyphens-auto">
                  {row.label}
                </span>
              </motion.div>
              <div className="flex min-h-11 min-w-0 flex-1 items-center gap-1 overflow-hidden rounded-[3px] bg-background/60 p-0.5 sm:min-h-12">
                {row.items.map((item, itemIndex) => (
                  <BoardItem
                    key={`${item.url}-${itemIndex}`}
                    item={item}
                    delay={tierItemDelay(rowIndex, itemIndex)}
                  />
                ))}
                {row.itemCount > row.items.length && (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[3px] bg-muted font-mono text-xs text-muted-foreground tabular-nums sm:size-11">
                    +{row.itemCount - row.items.length}
                  </span>
                )}
              </div>
            </div>
          ))}
          {bank.length > 0 && (
            <div className="mt-2 flex min-w-0 items-center gap-1 overflow-hidden rounded-[3px] border border-dashed border-border p-1">
              {bank.map((item, itemIndex) => (
                <BoardItem
                  key={`${item.url}-${itemIndex}`}
                  item={item}
                  delay={tierItemDelay(visibleRows.length, itemIndex)}
                  dimmed
                />
              ))}
            </div>
          )}
          {hiddenRows > 0 && (
            <p className="pt-1 text-xs text-muted-foreground">
              +{hiddenRows} more {hiddenRows === 1 ? 'tier' : 'tiers'}
            </p>
          )}
        </Link>
      </ViewTransition>

      {total > 0 && (
        <div className="flex flex-col gap-2">
          <motion.div
            variants={tierDistributionVariants}
            initial="hidden"
            animate="visible"
            custom={distributionDelay}
            aria-hidden="true"
            className="flex h-1.5 origin-left gap-0.5 overflow-hidden rounded-full"
          >
            {rows
              .filter((r) => r.itemCount > 0)
              .map((r) => (
                <span
                  key={r.id}
                  style={{ flexGrow: r.itemCount, background: r.color }}
                />
              ))}
            {bankCount > 0 && (
              <span className="bg-muted" style={{ flexGrow: bankCount }} />
            )}
          </motion.div>
          <p className="text-xs text-muted-foreground tabular-nums">
            <span className="text-foreground">{ranked}</span> of {total}{' '}
            {total === 1 ? 'item' : 'items'} ranked
            {bankCount > 0 && <> · {bankCount} waiting in the bank</>}
          </p>
        </div>
      )}
    </motion.section>
  )
}

function BoardItem({
  item,
  delay,
  dimmed = false,
}: {
  item: ImageItem
  delay: number
  dimmed?: boolean
}) {
  return (
    <motion.div
      variants={tierItemDropVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={cn(
        'relative size-10 shrink-0 overflow-hidden rounded-[3px] bg-muted sm:size-11',
        dimmed && 'saturate-50'
      )}
    >
      <Image src={item.url} alt="" fill sizes="44px" className="object-cover" />
    </motion.div>
  )
}

export function LatestTierBoardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="flex flex-col gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-1">
            <Skeleton className="h-11 w-14 rounded-[3px] sm:h-12 sm:w-16" />
            <Skeleton className="h-11 flex-1 rounded-[3px] sm:h-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  )
}
