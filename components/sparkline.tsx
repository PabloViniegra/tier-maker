import { cn } from '@/lib/utils'

interface SparklineProps {
  series: number[]
  width?: number
  height?: number
  className?: string
}

/**
 * Minimal SVG sparkline using CSS chart tokens (--chart-1 etc.).
 * Renders nothing for an empty series.
 * Handles single-point and all-equal-value series without division by zero.
 */
export function Sparkline({
  series,
  width = 64,
  height = 24,
  className,
}: SparklineProps) {
  if (series.length === 0) return null

  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min

  // Padding to keep the line inside the SVG viewport
  const padX = 2
  const padY = 2
  const innerW = width - padX * 2
  const innerH = height - padY * 2

  const toX = (i: number) =>
    series.length === 1
      ? padX + innerW / 2
      : padX + (i / (series.length - 1)) * innerW

  const toY = (v: number) =>
    range === 0
      ? padY + innerH / 2
      : padY + innerH - ((v - min) / range) * innerH

  const points = series.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className={cn(className)}
    >
      <polyline
        points={points}
        stroke="var(--chart-1)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
