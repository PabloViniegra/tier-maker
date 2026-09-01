export const LEGAL_UPDATED_AT = new Date('2026-06-07T00:00:00Z')

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date)
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return 'Never'
  const d = typeof date === 'string' ? new Date(date) : date
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (days === 0) return rtf.format(0, 'day')
  if (days < 30) return rtf.format(-days, 'day')
  const months = Math.floor(days / 30)
  if (months < 12) return rtf.format(-months, 'month')
  return rtf.format(-Math.floor(months / 12), 'year')
}
