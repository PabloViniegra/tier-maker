'use client'

import { motion } from 'motion/react'
import { Search, Layers } from 'lucide-react'
import { hasActiveFilters } from '@/lib/explore-params'
import type { ExploreFilters } from '@/lib/explore-params'
import {
  fadeUpVariants,
  staggerIndex,
  STAGGER_DELAY,
  cardLiftVariants,
} from '@/lib/motion-variants'
import { EmptyState } from '@/components/empty-state'
import { ExploreCard } from './explore-card'
import type { PublicTierListSummary } from '@/lib/queries/tier-templates'

const cardVariants = { ...fadeUpVariants, ...cardLiftVariants }

type Props = ExploreFilters & {
  items: PublicTierListSummary[]
  likedIds: string[]
  currentUserId: string | null
  isAuthenticated: boolean
  fillHrefPrefix?: string
  clearFiltersHref?: string
}

export function ExploreGrid({
  items,
  q,
  category,
  sort,
  likedIds,
  currentUserId,
  isAuthenticated,
  fillHrefPrefix,
  clearFiltersHref = '/explore',
}: Props) {
  if (items.length === 0) {
    const filtersActive = hasActiveFilters({ q, category, sort })

    return filtersActive ? (
      <EmptyState
        icon={Search}
        title="No tier lists match your filters"
        description="Try adjusting or clearing your search and filters."
        cta={{ label: 'Clear filters', href: clearFiltersHref }}
      />
    ) : (
      <EmptyState
        icon={Layers}
        title="No public tier lists yet"
        description="Be the first to create and share a tier list."
      />
    )
  }

  const likedSet = new Set(likedIds)

  return (
    <div role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          role="listitem"
          tabIndex={-1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={staggerIndex(i) * STAGGER_DELAY}
          whileHover="hover"
          whileTap="tap"
        >
          <ExploreCard
            data={item}
            isLiked={likedSet.has(item.id)}
            isOwner={currentUserId !== null && item.creatorId === currentUserId}
            isAuthenticated={isAuthenticated}
            href={fillHrefPrefix ? `${fillHrefPrefix}/${item.id}` : undefined}
          />
        </motion.div>
      ))}
    </div>
  )
}
