export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return 'Never'
  const d = typeof date === 'string' ? new Date(date) : date
  const now = Date.now()
  const diff = now - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1mo ago'
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
