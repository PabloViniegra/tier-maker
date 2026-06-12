type PublicItemBankStripProps = {
  items: { url: string; label: string }[]
}

export function PublicItemBankStrip({ items }: PublicItemBankStripProps) {
  return (
    <div
      suppressHydrationWarning
      className="border-t-2 border-border bg-surface shadow-[0_-4px_16px_oklch(0_0_0/0.07)]"
    >
      <div className="px-4 pt-2 pb-1">
        <p className="text-xs font-medium text-muted-foreground">
          Items ({items.length})
        </p>
      </div>
      <div className="flex min-h-24 items-center gap-2 overflow-x-auto px-4 pt-1 pb-3">
        {items.length === 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">
            All items placed
          </span>
        )}
        {items.map((item) => (
          <div key={item.url} className="relative h-20 w-20 shrink-0">
            <div className="relative h-full w-full overflow-hidden rounded border border-border bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.label}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
