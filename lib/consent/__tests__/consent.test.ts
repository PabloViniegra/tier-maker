import { describe, it, expect, beforeEach } from 'vitest'
import { getConsentStatus, setConsentStatus, clearConsentStatus } from '../consent'

const CONSENT_KEY = 'cookie-consent'

beforeEach(() => {
  localStorage.clear()
})

describe('getConsentStatus', () => {
  it('returns pending when no preference is stored', () => {
    expect(getConsentStatus()).toBe('pending')
  })

  it('returns accepted when stored value is accepted', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    expect(getConsentStatus()).toBe('accepted')
  })

  it('returns rejected when stored value is rejected', () => {
    localStorage.setItem(CONSENT_KEY, 'rejected')
    expect(getConsentStatus()).toBe('rejected')
  })

  it('returns pending for an unrecognised stored value', () => {
    localStorage.setItem(CONSENT_KEY, 'garbage')
    expect(getConsentStatus()).toBe('pending')
  })
})

describe('setConsentStatus', () => {
  it('writes accepted to localStorage', () => {
    setConsentStatus('accepted')
    expect(localStorage.getItem(CONSENT_KEY)).toBe('accepted')
  })

  it('writes rejected to localStorage', () => {
    setConsentStatus('rejected')
    expect(localStorage.getItem(CONSENT_KEY)).toBe('rejected')
  })
})

describe('clearConsentStatus', () => {
  it('removes the preference key from localStorage', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    clearConsentStatus()
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull()
  })
})
