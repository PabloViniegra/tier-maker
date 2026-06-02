import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { TierListCard, type TierListCardProps } from './tier-list-card'
import { DashboardEmptyState } from './dashboard-empty-state'

export function TierListGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Separator />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-14" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TierListGrid({ tierLists }: { tierLists: TierListCardProps[] }) {
  if (tierLists.length === 0) {
    return <DashboardEmptyState />
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tierLists.map((tierList, i) => (
        <TierListCard
          key={tierList.id}
          {...tierList}
          className="animate-fade-in-up"
          style={{ '--delay': `${i * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
