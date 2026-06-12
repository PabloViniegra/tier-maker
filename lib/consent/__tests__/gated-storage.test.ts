import { describe, it, expect, beforeEach } from 'vitest'
import { gatedSet } from '../gated-storage'

const CONSENT_KEY = 'cookie-consent'
const TEST_KEY = 'test-key'

beforeEach(() => {
  localStorage.clear()
})

describe('gatedSet — consent accepted', () => {
  beforeEach(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
  })

  it('writes to localStorage', () => {
    gatedSet(TEST_KEY, 'value')
    expect(localStorage.getItem(TEST_KEY)).toBe('value')
  })
})

describe('gatedSet — consent pending', () => {
  it('writes to localStorage', () => {
    gatedSet(TEST_KEY, 'value')
    expect(localStorage.getItem(TEST_KEY)).toBe('value')
  })
})

describe('gatedSet — consent rejected', () => {
  beforeEach(() => {
    localStorage.setItem(CONSENT_KEY, 'rejected')
  })

  it('does not write to localStorage', () => {
    gatedSet(TEST_KEY, 'value')
    expect(localStorage.getItem(TEST_KEY)).toBeNull()
  })

  it('does not overwrite an existing value', () => {
    localStorage.setItem(TEST_KEY, 'original')
    gatedSet(TEST_KEY, 'overwrite')
    expect(localStorage.getItem(TEST_KEY)).toBe('original')
  })
})
