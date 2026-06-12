const CONSENT_KEY = 'cookie-consent'

export type StoredConsent = 'accepted' | 'rejected'
export type ConsentStatus = StoredConsent | 'pending'

export function getConsentStatus(): ConsentStatus {
  const value = localStorage.getItem(CONSENT_KEY)
  if (value === 'accepted' || value === 'rejected') return value
  return 'pending'
}

export function setConsentStatus(status: StoredConsent): void {
  localStorage.setItem(CONSENT_KEY, status)
}

export function clearConsentStatus(): void {
  localStorage.removeItem(CONSENT_KEY)
}
