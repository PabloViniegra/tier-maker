import { gatedSet } from '@/lib/consent/gated-storage'

const STORAGE_KEY = 'tier-maker-anon-id'

export function getOrCreateAnonId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  gatedSet(STORAGE_KEY, id)
  return id
}
