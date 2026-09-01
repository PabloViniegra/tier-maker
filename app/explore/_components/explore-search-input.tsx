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

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

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
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        name="q"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        placeholder="Search tier lists…"
        aria-label="Search tier lists"
        className="w-full rounded-md border border-border bg-surface py-2 pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:outline-none"
      />
    </div>
  )
}
