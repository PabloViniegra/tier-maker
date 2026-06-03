'use client'

import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useExploreFilters } from '../_hooks/use-explore-filters'

const DEBOUNCE_MS = 400

type Props = {
  defaultValue: string
}

export function ExploreSearchInput({ defaultValue }: Props) {
  const { setSearch } = useExploreFilters()
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setValue(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSearch(q), DEBOUNCE_MS)
  }

  return (
    <div className="relative w-full max-w-md">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search tier lists…"
        className="w-full rounded-md border border-border bg-surface py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
    </div>
  )
}
