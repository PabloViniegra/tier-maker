'use client'

import { motion } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { TierListCard, type TierListCardProps } from './tier-list-card'
import { DashboardEmptyState } from './dashboard-empty-state'
import { fadeUpVariants, staggerIndex, STAGGER_DELAY, springTransition } from '@/lib/motion-variants'

export function TierListGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-surface overflow-hidden">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex flex-col gap-3 px-4 pb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Separator />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TierListGrid({ tierLists }: { tierLists: TierListCardProps[] }) {
  if (tierLists.length === 0) {
    return (
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <DashboardEmptyState />
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
    >
      {tierLists.map((tierList, i) => (
        <motion.div
          key={tierList.id}
          variants={fadeUpVariants}
          custom={staggerIndex(i) * STAGGER_DELAY}
          whileHover={{ y: -2, transition: springTransition }}
          whileTap={{ scale: 0.99, y: 0, transition: { duration: 0.1, ease: 'easeOut' } }}
        >
          <TierListCard {...tierList} />
        </motion.div>
      ))}
    </motion.div>
  )
}
