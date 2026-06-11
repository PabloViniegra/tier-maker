import { Skeleton } from '@/components/ui/skeleton'

/** Single card skeleton matching ExploreCard geometry exactly. */
function ExploreCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface overflow-hidden">
      {/* Cover image — aspect-video */}
      <Skeleton className="aspect-video w-full rounded-none" />

      <div className="flex flex-col gap-3 px-4 pb-4">
        {/* Badge row: category badge + date */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-3 w-14 rounded-sm" />
        </div>

        {/* Title line */}
        <Skeleton className="h-4 w-4/5 rounded-sm" />

        {/* Separator */}
        <Skeleton className="h-px w-full rounded-none" />

        {/* Footer row: items count + fill button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Skeleton className="h-3 w-12 rounded-sm" />
            <Skeleton className="h-2.5 w-16 rounded-sm" />
          </div>
          <Skeleton className="h-6 w-12 rounded-md" />
        </div>
      </div>
    </div>
  )
}

/** Grid skeleton matching ExploreGrid column breakpoints exactly (1 → sm:2 → lg:3 → xl:4). */
export function ExploreGridSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <ExploreCardSkeleton key={i} />
      ))}
    </div>
  )
}
