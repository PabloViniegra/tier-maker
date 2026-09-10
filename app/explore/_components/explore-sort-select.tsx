'use client'

import { ArrowUpDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_SORT } from '@/lib/explore-params'
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
  const isFiltered = value !== DEFAULT_SORT

  return (
    <Select items={OPTIONS} value={value} onValueChange={setSort}>
      <SelectTrigger className="min-w-44" aria-label="Sort tier lists by">
        <ArrowUpDown
          aria-hidden="true"
          className={
            isFiltered
              ? 'size-3.5 text-primary'
              : 'size-3.5 text-muted-foreground'
          }
        />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort</SelectLabel>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
