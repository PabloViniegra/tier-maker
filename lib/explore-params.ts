import type { ExploreSort } from './queries/tier-templates'

export const PAGE_SIZE = 12
export const VALID_SORTS = new Set<ExploreSort>(['newest', 'oldest', 'a-z'])

export function toSort(raw: string | undefined): ExploreSort {
  return VALID_SORTS.has(raw as ExploreSort) ? (raw as ExploreSort) : 'newest'
}
