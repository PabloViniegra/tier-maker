'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ExploreSort } from '@/lib/queries/tier-templates'

type FilterKey = 'q' | 'category' | 'sort'

export function useExploreFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const push = useCallback(
    (key: FilterKey, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value != null && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.set('page', '1')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  const setSearch = useCallback((q: string) => push('q', q || null), [push])
  const setCategory = useCallback(
    (cat: string | null) => push('category', cat === 'all' ? null : cat),
    [push]
  )
  const setSort = useCallback((sort: ExploreSort | null) => push('sort', sort), [push])

  return { setSearch, setCategory, setSort }
}
