import { Skeleton } from '@/components/ui/skeleton'
import { ExploreGridSkeleton } from '@/app/explore/_components/explore-grid-skeleton'

export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="border-b border-border bg-background/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 pt-3">
          <Skeleton className="h-7 w-20" />
        </div>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 pt-3 pb-6">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8">
        <ExploreGridSkeleton />
      </div>
    </div>
  )
}
