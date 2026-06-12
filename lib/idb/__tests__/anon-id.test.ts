import { describe, it, expect, beforeEach } from 'vitest'
import { getOrCreateAnonId } from '../anon-id'

const STORAGE_KEY = 'tier-maker-anon-id'
const CONSENT_KEY = 'cookie-consent'

beforeEach(() => {
  localStorage.clear()
})

describe('getOrCreateAnonId — consent accepted', () => {
  beforeEach(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
  })

  it('generates and stores a UUID on first call', () => {
    const id = getOrCreateAnonId()
    expect(id).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEY)).toBe(id)
  })

  it('returns the same UUID on subsequent calls', () => {
    const first = getOrCreateAnonId()
    const second = getOrCreateAnonId()
    expect(second).toBe(first)
  })

  it('reuses an existing UUID from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'existing-uuid')
    const id = getOrCreateAnonId()
    expect(id).toBe('existing-uuid')
  })
})

describe('getOrCreateAnonId — consent pending (no decision yet)', () => {
  it('generates and stores a UUID (legacy behaviour preserved)', () => {
    const id = getOrCreateAnonId()
    expect(id).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEY)).toBe(id)
  })
})

describe('getOrCreateAnonId — consent rejected', () => {
  beforeEach(() => {
    localStorage.setItem(CONSENT_KEY, 'rejected')
  })

  it('does not write to localStorage', () => {
    getOrCreateAnonId()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('still returns a usable string ID', () => {
    const id = getOrCreateAnonId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns the existing ID if one was stored before rejection', () => {
    localStorage.setItem(STORAGE_KEY, 'pre-existing-uuid')
    const id = getOrCreateAnonId()
    expect(id).toBe('pre-existing-uuid')
  })
})
