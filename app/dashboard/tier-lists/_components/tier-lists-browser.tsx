'use client'

import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/empty-state'
import { TierListGrid } from '@/app/dashboard/_components/tier-list-grid'
import type { TierListCardProps } from '@/app/dashboard/_components/tier-list-card'

export function TierListsBrowser({
  tierLists,
}: {
  tierLists: TierListCardProps[]
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tierLists
    return tierLists.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    )
  }, [tierLists, query])

  if (tierLists.length === 0) {
    return <TierListGrid tierLists={tierLists} />
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title or category"
        aria-label="Search your tier lists"
        className="max-w-xs"
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matches"
          description={`No tier lists match "${query.trim()}".`}
        />
      ) : (
        <TierListGrid tierLists={filtered} />
      )}
    </div>
  )
}
