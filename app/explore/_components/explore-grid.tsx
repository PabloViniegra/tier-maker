'use client'

import { motion } from 'motion/react'
import { hasActiveFilters } from '@/lib/explore-params'
import type { ExploreFilters } from '@/lib/explore-params'
import { fadeUpVariants, staggerIndex, STAGGER_DELAY, cardLiftVariants } from '@/lib/motion-variants'
import { ExploreCard } from './explore-card'
import { ExploreEmptyState } from './explore-empty-state'
import type { PublicTierListSummary } from '@/lib/queries/tier-templates'

const cardVariants = { ...fadeUpVariants, ...cardLiftVariants }

type Props = ExploreFilters & {
  items: PublicTierListSummary[]
}

export function ExploreGrid({ items, q, category, sort }: Props) {
  if (items.length === 0) {
    return <ExploreEmptyState filtersActive={hasActiveFilters({ q, category, sort })} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={staggerIndex(i) * STAGGER_DELAY}
          whileHover="hover"
          whileTap="tap"
        >
          <ExploreCard data={item} />
        </motion.div>
      ))}
    </div>
  )
}
