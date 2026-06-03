'use client'

import {
  Select,
  SelectContent,
  SelectItem,
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

  return (
    <Select value={value || 'all'} onValueChange={setCategory}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
