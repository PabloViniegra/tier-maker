/**
 * Buckets an array of dates into daily counts over a sliding window.
 *
 * Returns an array of length `days` where index 0 is the oldest day
 * (anchor − days + 1) and index days−1 is the anchor day (inclusive).
 * All dates are normalised to UTC midnight for bucketing.
 */
export function bucketByDay(dates: Date[], days: number, anchor: Date): number[] {
  const buckets = new Array<number>(days).fill(0)

  // Start-of-UTC-day for the anchor
  const anchorDay = utcDayStart(anchor)

  for (const d of dates) {
    const day = utcDayStart(d)
    const diffDays = Math.round((anchorDay - day) / MS_PER_DAY)
    // diffDays === 0 → anchor day (last bucket), diffDays === days-1 → first bucket
    if (diffDays < 0 || diffDays >= days) continue
    buckets[days - 1 - diffDays]++
  }

  return buckets
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function utcDayStart(d: Date): number {
  const ms = d instanceof Date ? d.getTime() : new Date(d).getTime()
  return ms - (ms % MS_PER_DAY)
}
