import { describe, it, expect, beforeEach } from 'vitest'
import { getOrCreateAnonId } from '../anon-id'

const STORAGE_KEY = 'tier-maker-anon-id'

beforeEach(() => {
  localStorage.clear()
})

describe('getOrCreateAnonId', () => {
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
