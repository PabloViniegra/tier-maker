'use client'

import { Tags } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExploreFilters } from '../_hooks/use-explore-filters'

type Props = {
  categories: string[]
  value: string
}

export function ExploreCategoryFilter({ categories, value }: Props) {
  const { setCategory } = useExploreFilters()
  const items = [
    { value: 'all', label: 'All categories' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ]
  const isFiltered = Boolean(value && value !== 'all')

  return (
    <Select items={items} value={value || 'all'} onValueChange={setCategory}>
      <SelectTrigger className="min-w-44" aria-label="Filter by category">
        <Tags
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
          <SelectLabel>Category</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
