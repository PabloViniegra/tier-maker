import type { ExploreSort } from './queries/tier-templates'

export const PAGE_SIZE = 12
export const DEFAULT_SORT: ExploreSort = 'newest'
export const VALID_SORTS = new Set<ExploreSort>(['newest', 'oldest', 'a-z'])

export function toSort(raw: string | undefined): ExploreSort {
  return VALID_SORTS.has(raw as ExploreSort) ? (raw as ExploreSort) : DEFAULT_SORT
}

export type ExploreFilters = {
  q: string
  category: string
  sort: ExploreSort
}

export function hasActiveFilters({ q, category, sort }: ExploreFilters): boolean {
  return q !== '' || category !== '' || sort !== DEFAULT_SORT
}
