import React from 'react'

export function TierMakerIcon({
  size = 20,
  ...props
}: {
  size?: number
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      data-testid="tier-maker-icon"
      {...props}
    >
      <rect x={0} y={2} width={20} height={3} fill="var(--color-primary)" />
      <rect x={0} y={8} width={14} height={3} fill="var(--color-primary)" fillOpacity={0.6} />
      <rect x={0} y={14} width={8} height={3} fill="var(--color-primary)" fillOpacity={0.3} />
    </svg>
  )
}
