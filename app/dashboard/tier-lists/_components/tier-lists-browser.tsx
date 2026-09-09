'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const setQuery = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextQuery.trim()) {
        params.set('q', nextQuery)
      } else {
        params.delete('q')
      }
      const queryString = params.toString()
      router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

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
        name="q"
        autoComplete="off"
        enterKeyHint="search"
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
