import { PublicTierRow } from './public-tier-row'
import { PublicItemBankStrip } from './public-item-bank-strip'
import type { PublicTierRowData } from './public-tier-row'

type PublicTierBoardProps = {
  rows: PublicTierRowData[]
  sidebarItems: { url: string; label: string }[]
  boardRef?: React.RefObject<HTMLElement | null>
}

export function PublicTierBoard({
  rows,
  sidebarItems,
  boardRef,
}: PublicTierBoardProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <section
          ref={boardRef}
          className="flex flex-col gap-1.5"
          aria-label="Tier list board"
        >
          {rows.map((row) => (
            <PublicTierRow key={row.id} row={row} />
          ))}
        </section>
      </div>
      <div className="shrink-0">
        <PublicItemBankStrip items={sidebarItems} />
      </div>
    </div>
  )
}
