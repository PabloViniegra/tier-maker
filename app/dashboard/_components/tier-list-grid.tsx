import { TierListCard, type TierListCardProps } from './tier-list-card'
import { DashboardEmptyState } from './dashboard-empty-state'

export function TierListGrid({ tierLists }: { tierLists: TierListCardProps[] }) {
  if (tierLists.length === 0) {
    return <DashboardEmptyState />
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tierLists.map((tierList, i) => (
        <div
          key={tierList.id}
          className="animate-fade-in-up"
          style={{ '--delay': `${i * 50}ms` } as React.CSSProperties}
        >
          <TierListCard {...tierList} />
        </div>
      ))}
    </div>
  )
}
