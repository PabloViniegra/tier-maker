import Link from 'next/link'
import { Search, Layers } from 'lucide-react'

type Props = {
  filtersActive: boolean
}

export function ExploreEmptyState({ filtersActive }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-12 text-center">
      {filtersActive ? (
        <>
          <Search size={32} strokeWidth={1} className="text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h4 className="font-heading text-base">No tier lists match your filters</h4>
            <p className="text-sm text-muted-foreground">
              Try adjusting or clearing your search and filters.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Clear filters
          </Link>
        </>
      ) : (
        <>
          <Layers size={32} strokeWidth={1} className="text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h4 className="font-heading text-base">No public tier lists yet</h4>
            <p className="text-sm text-muted-foreground">
              Be the first to create and share a tier list.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
