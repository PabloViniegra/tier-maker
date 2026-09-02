type PublicItemBankStripProps = {
  items: { url: string; label: string }[]
  showInstructions?: boolean
}

export function PublicItemBankStrip({
  items,
  showInstructions = false,
}: PublicItemBankStripProps) {
  return (
    <div
      suppressHydrationWarning
      className="border-t-2 border-border bg-surface shadow-overlay"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-4 pt-2 pb-1">
        <p className="text-xs font-medium text-muted-foreground">
          Items to place ({items.length})
        </p>
        {showInstructions && (
          <p className="text-xs text-muted-foreground">
            Drag an item into a tier. Keyboard: focus an item, press Space, use
            the arrow keys, then press Space to place it.
          </p>
        )}
      </div>
      <div className="flex min-h-24 items-center gap-2 overflow-x-auto overscroll-contain px-4 pt-1 pb-3">
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
