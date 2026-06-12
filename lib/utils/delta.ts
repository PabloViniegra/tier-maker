export type DeltaDirection = 'positive' | 'negative' | 'neutral'

export interface DeltaResult {
  formatted: string
  direction: DeltaDirection
  percentage: number
}

/**
 * Computes the percentage delta between current and previous values.
 * Returns null when previous is undefined, null, or zero (avoids division by zero).
 */
export function formatDelta(
  current: number,
  previous: number | undefined | null
): DeltaResult | null {
  if (previous === undefined || previous === null || previous === 0) {
    return null
  }

  const percentage = ((current - previous) / Math.abs(previous)) * 100
  const abs = Math.abs(percentage).toFixed(1)

  let formatted: string
  let direction: DeltaDirection

  if (percentage > 0) {
    formatted = `+${abs}%`
    direction = 'positive'
  } else if (percentage < 0) {
    formatted = `−${abs}%`
    direction = 'negative'
  } else {
    formatted = `${abs}%`
    direction = 'neutral'
  }

  return { formatted, direction, percentage }
}
