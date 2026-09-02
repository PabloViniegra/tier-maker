import { cn } from '@/lib/utils'
import { TIER_COLORS } from '@/lib/validators/tier-list'

const ROWS = [
  { label: 'S', items: ['Interstellar', 'Blade Runner 2049'] },
  { label: 'A', items: ['Arrival', 'Ex Machina'] },
  { label: 'B', items: ['Her', 'The Martian'] },
  { label: 'C', items: ['Gravity'] },
] as const

export function AuthTierPreview({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const rows = compact ? ROWS.slice(0, 2) : ROWS

  return (
    <div aria-hidden="true" className={cn('w-full max-w-lg', className)}>
      <p
        className={cn(
          'font-heading font-semibold text-foreground',
          compact ? 'text-sm' : 'text-base'
        )}
      >
        Best sci-fi of the 2010s
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-stretch gap-1.5">
            <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded">
              <span
                className="w-1 shrink-0"
                style={{ background: TIER_COLORS[row.label] }}
              />
              <span className="flex flex-1 items-center justify-center bg-muted font-heading text-xs font-bold text-foreground">
                {row.label}
              </span>
            </div>
            <div className="flex min-h-8 min-w-0 flex-1 flex-wrap items-center gap-1 rounded border border-border bg-background px-1.5">
              {row.items.map((item) => (
                <span
                  key={item}
                  className="rounded bg-muted px-2 py-0.5 text-xs text-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
