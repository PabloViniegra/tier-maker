'use client'

import { motion } from 'motion/react'
import { fadeUpVariants, staggerIndex, STAGGER_DELAY } from '@/lib/motion-variants'
import { ExploreCard } from './explore-card'
import type { PublicTierListSummary } from '@/lib/queries/tier-templates'

type Props = {
  items: PublicTierListSummary[]
}

export function ExploreGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">
          No tier lists match your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={staggerIndex(i) * STAGGER_DELAY}
        >
          <ExploreCard {...item} />
        </motion.div>
      ))}
    </div>
  )
}
