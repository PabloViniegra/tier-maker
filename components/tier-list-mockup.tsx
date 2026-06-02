const TIERS = [
  {
    label: 'S',
    color: 'oklch(0.65 0.22 250)',
    items: ['The Godfather', 'Interstellar', 'Parasite'],
  },
  {
    label: 'A',
    color: 'oklch(0.65 0.20 145)',
    items: ['Blade Runner 2049', 'Dune', 'Mad Max: Fury Road'],
  },
  {
    label: 'B',
    color: 'oklch(0.68 0.18 75)',
    items: ['Arrival', 'Hereditary'],
  },
  {
    label: 'C',
    color: 'oklch(0.65 0.20 45)',
    items: ['Tenet', 'The Menu'],
  },
  {
    label: 'D',
    color: 'oklch(0.62 0.18 15)',
    items: ['Cats (2019)'],
  },
]

export function TierListMockup() {
  return (
    <div className='flex flex-col gap-1.5'>
      {TIERS.map((tier) => (
        <div key={tier.label} className='flex items-stretch gap-1.5'>
          <div
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded font-heading text-sm font-bold text-white'
            style={{ background: tier.color }}
          >
            {tier.label}
          </div>
          <div className='flex flex-1 flex-wrap items-center gap-1.5 rounded border border-border bg-background px-2'>
            {tier.items.map((item) => (
              <span
                key={item}
                className='rounded bg-muted px-2 py-0.5 text-xs text-foreground'
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
