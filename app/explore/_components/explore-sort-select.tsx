'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExploreFilters } from '../_hooks/use-explore-filters'
import type { ExploreSort } from '@/lib/queries/tier-templates'

const OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'a-z', label: 'A → Z' },
  { value: 'popular', label: 'Most liked' },
]

type Props = {
  value: ExploreSort
}

export function ExploreSortSelect({ value }: Props) {
  const { setSort } = useExploreFilters()

  return (
    <Select value={value} onValueChange={setSort}>
      <SelectTrigger className="w-[150px]" aria-label="Sort tier lists by">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
