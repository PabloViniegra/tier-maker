const TIERS = [
  { label: 'S', color: 'oklch(0.65 0.22 250)' },
  { label: 'A', color: 'oklch(0.65 0.20 145)' },
  { label: 'B', color: 'oklch(0.68 0.18 75)' },
  { label: 'C', color: 'oklch(0.65 0.20 45)' },
  { label: 'D', color: 'oklch(0.62 0.18 15)' },
]

export function TierRowsBackground({
  showLabels = true,
}: {
  showLabels?: boolean
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {TIERS.map((tier, i) => (
        <div
          key={tier.label}
          className="absolute flex items-stretch opacity-[0.18] blur-[0.5px]"
          style={{
            top: `${13 + i * 15}%`,
            left: '-4%',
            right: '-4%',
            height: '52px',
          }}
        >
          {showLabels ? (
            <div
              className="flex w-16 shrink-0 items-center justify-center font-heading text-2xl font-bold text-white"
              style={{ background: tier.color }}
            >
              {tier.label}
            </div>
          ) : null}
          <div
            className="flex-1 border border-white/10 bg-white/[0.04]"
            style={
              showLabels
                ? undefined
                : {
                    background: `color-mix(in oklch, ${tier.color} 22%, transparent)`,
                  }
            }
          />
        </div>
      ))}
    </div>
  )
}
