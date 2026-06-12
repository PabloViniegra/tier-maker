import { PublicTierItem } from './public-tier-item'
import { cn } from '@/lib/utils'

export type PublicTierRowData = {
  id: string
  label: string
  color: string
  order: number
  items: { url: string; label: string }[]
}

type PublicTierRowProps = {
  row: PublicTierRowData
}

const CHIP_HEIGHT = '24'

export function PublicTierRow({ row }: PublicTierRowProps) {
  const chipCls = CHIP_HEIGHT === '24' ? 'h-24 w-24' : 'h-16 w-20'
  const rowHeightCls = CHIP_HEIGHT === '24' ? 'min-h-24' : 'min-h-16'

  return (
    <div
      className="flex items-stretch gap-1.5"
      data-testid="tier-row"
      aria-label={`Tier ${row.label}`}
    >
      {/* Tier label chip — visual-only, no interactive controls */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded font-heading text-sm font-bold text-white',
          chipCls
        )}
        style={{ background: row.color }}
        aria-label={`Tier ${row.label}`}
      >
        <span className="line-clamp-2 px-1 text-center text-xs leading-tight break-words select-none">
          {row.label}
        </span>
      </div>

      {/* Items droppable zone — rendered as static HTML for server/crawler */}
      <div
        className={cn(
          'flex flex-1 flex-wrap items-center gap-1.5 rounded border border-border bg-surface px-2 py-1.5',
          rowHeightCls
        )}
        data-testid="tier-row-droppable"
      >
        {row.items.length === 0 && (
          <span className="text-xs text-muted-foreground">Drag items here</span>
        )}
        {row.items.map((item) => (
          <PublicTierItem key={item.url} url={item.url} label={item.label} />
        ))}
      </div>
    </div>
  )
}
