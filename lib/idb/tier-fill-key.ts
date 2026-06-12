import { getOrCreateAnonId } from './anon-id'

export function buildTierFillKey(
  userId: string | null,
  tierId: string
): string {
  if (userId) return `${userId}:${tierId}`
  return `anon-${getOrCreateAnonId()}:${tierId}`
}
