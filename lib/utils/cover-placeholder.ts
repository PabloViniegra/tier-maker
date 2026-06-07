function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
  }
  return Math.abs(hash)
}

export function getInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function getCategoryGradient(category: string): string {
  const hue = djb2(category) % 360
  const hue2 = (hue + 30) % 360
  return `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${hue2}, 65%, 45%))`
}
