const STORAGE_KEY = 'tier-maker-anon-id'

export function getOrCreateAnonId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
