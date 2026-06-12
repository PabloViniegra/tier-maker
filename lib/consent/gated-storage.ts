import { getConsentStatus } from './consent'

export function gatedSet(key: string, value: string): void {
  if (getConsentStatus() === 'rejected') return
  localStorage.setItem(key, value)
}
