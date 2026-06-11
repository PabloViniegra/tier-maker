import { describe, it, expect } from 'vitest'
import { formatDelta } from './delta'

describe('formatDelta', () => {
  it('returns positive delta with + sign for increase', () => {
    const result = formatDelta(120, 100)
    expect(result).not.toBeNull()
    expect(result?.formatted).toBe('+20.0%')
    expect(result?.direction).toBe('positive')
  })

  it('returns negative delta with − sign for decrease', () => {
    const result = formatDelta(80, 100)
    expect(result).not.toBeNull()
    expect(result?.formatted).toBe('−20.0%')
    expect(result?.direction).toBe('negative')
  })

  it('returns neutral for zero change', () => {
    const result = formatDelta(100, 100)
    expect(result).not.toBeNull()
    expect(result?.formatted).toBe('0.0%')
    expect(result?.direction).toBe('neutral')
  })

  it('returns null delta when previous is undefined', () => {
    const result = formatDelta(100, undefined)
    expect(result).toBeNull()
  })

  it('returns null delta when previous is null', () => {
    const result = formatDelta(100, null)
    expect(result).toBeNull()
  })

  it('handles large percentage increase', () => {
    const result = formatDelta(300, 100)
    expect(result?.formatted).toBe('+200.0%')
    expect(result?.direction).toBe('positive')
  })

  it('rounds to one decimal place', () => {
    const result = formatDelta(110, 99)
    expect(result?.formatted).toMatch(/^[+−-]\d+\.\d%$/)
  })

  it('uses − (minus sign U+2212) not hyphen for negative', () => {
    const result = formatDelta(50, 100)
    expect(result?.formatted.startsWith('−')).toBe(true)
  })

  it('returns null when previous is zero to avoid division by zero', () => {
    const result = formatDelta(50, 0)
    expect(result).toBeNull()
  })
})
