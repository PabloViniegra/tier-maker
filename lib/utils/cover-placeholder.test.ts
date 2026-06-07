import { describe, it, expect } from 'vitest'
import { getInitials, getCategoryGradient } from './cover-placeholder'

describe('getInitials', () => {
  it('returns the first letter of a single-word title, uppercased', () => {
    expect(getInitials('valorant')).toBe('V')
  })

  it('returns first letters of first two words for multi-word title', () => {
    expect(getInitials('My Anime Rankings')).toBe('MA')
  })

  it('caps at 2 initials even with more than 2 words', () => {
    expect(getInitials('The Best Tier List Ever')).toBe('TB')
  })

  it('returns "?" for empty string', () => {
    expect(getInitials('')).toBe('?')
  })

  it('returns "?" for whitespace-only string', () => {
    expect(getInitials('   ')).toBe('?')
  })

  it('uppercases already-uppercase input unchanged', () => {
    expect(getInitials('ANIME RANKINGS')).toBe('AR')
  })
})

describe('getCategoryGradient', () => {
  it('returns a string containing "linear-gradient"', () => {
    expect(getCategoryGradient('anime')).toContain('linear-gradient')
  })

  it('returns a string containing "hsl("', () => {
    expect(getCategoryGradient('anime')).toContain('hsl(')
  })

  it('is deterministic — same category always returns the same value', () => {
    expect(getCategoryGradient('sports')).toBe(getCategoryGradient('sports'))
  })

  it('returns different gradients for different categories', () => {
    expect(getCategoryGradient('anime')).not.toBe(getCategoryGradient('sports'))
  })
})
