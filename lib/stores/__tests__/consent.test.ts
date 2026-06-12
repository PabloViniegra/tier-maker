import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useConsentStore } from '../consent'

const CONSENT_KEY = 'cookie-consent'

beforeEach(() => {
  localStorage.clear()
  useConsentStore.setState({ status: 'pending' })
})

afterEach(() => {
  localStorage.clear()
  useConsentStore.setState({ status: 'pending' })
})

describe('useConsentStore — initial state', () => {
  it('starts as pending when no preference is stored', () => {
    expect(useConsentStore.getState().status).toBe('pending')
  })
})

describe('useConsentStore — accept', () => {
  it('sets status to accepted', () => {
    useConsentStore.getState().accept()
    expect(useConsentStore.getState().status).toBe('accepted')
  })

  it('writes accepted to localStorage', () => {
    useConsentStore.getState().accept()
    expect(localStorage.getItem(CONSENT_KEY)).toBe('accepted')
  })
})

describe('useConsentStore — reject', () => {
  it('sets status to rejected', () => {
    useConsentStore.getState().reject()
    expect(useConsentStore.getState().status).toBe('rejected')
  })

  it('writes rejected to localStorage', () => {
    useConsentStore.getState().reject()
    expect(localStorage.getItem(CONSENT_KEY)).toBe('rejected')
  })
})
