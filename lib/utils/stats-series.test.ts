import { describe, it, expect } from 'vitest'
import { bucketByDay } from './stats-series'

describe('bucketByDay', () => {
  it('returns a zero-filled array of the requested length for empty input', () => {
    const result = bucketByDay([], 7, new Date('2026-06-11'))
    expect(result).toHaveLength(7)
    expect(result.every((v) => v === 0)).toBe(true)
  })

  it('counts a date into the correct bucket', () => {
    const anchor = new Date('2026-06-11T12:00:00Z')
    const dates = [new Date('2026-06-10T08:00:00Z')] // 1 day before anchor
    const result = bucketByDay(dates, 7, anchor)
    // bucket index 5 = yesterday (anchor - 1 day)
    expect(result[5]).toBe(1)
  })

  it('counts dates on the anchor day into the last bucket', () => {
    const anchor = new Date('2026-06-11T23:59:59Z')
    const dates = [
      new Date('2026-06-11T00:00:00Z'),
      new Date('2026-06-11T12:00:00Z'),
    ]
    const result = bucketByDay(dates, 7, anchor)
    expect(result[6]).toBe(2)
  })

  it('ignores dates before the window', () => {
    const anchor = new Date('2026-06-11T00:00:00Z')
    const dates = [new Date('2026-05-01T00:00:00Z')] // well before 7-day window
    const result = bucketByDay(dates, 7, anchor)
    expect(result.every((v) => v === 0)).toBe(true)
  })

  it('ignores dates after the anchor', () => {
    const anchor = new Date('2026-06-11T00:00:00Z')
    const dates = [new Date('2026-06-12T00:00:00Z')]
    const result = bucketByDay(dates, 7, anchor)
    expect(result.every((v) => v === 0)).toBe(true)
  })

  it('accumulates multiple dates into the same bucket', () => {
    const anchor = new Date('2026-06-11T23:59:59Z')
    const dates = [
      new Date('2026-06-05T10:00:00Z'),
      new Date('2026-06-05T14:00:00Z'),
      new Date('2026-06-05T18:00:00Z'),
    ]
    const result = bucketByDay(dates, 7, anchor)
    // 2026-06-05 is 6 days before anchor (2026-06-11), so bucket index 0
    expect(result[0]).toBe(3)
  })

  it('handles a 14-day window correctly', () => {
    const anchor = new Date('2026-06-11T00:00:00Z')
    const dates = [
      new Date('2026-05-29T00:00:00Z'), // 13 days before anchor — bucket 0
      new Date('2026-06-11T00:00:00Z'), // same day as anchor — bucket 13
    ]
    const result = bucketByDay(dates, 14, anchor)
    expect(result).toHaveLength(14)
    expect(result[0]).toBe(1)
    expect(result[13]).toBe(1)
  })

  it('counts dates exactly on the window start boundary (inclusive)', () => {
    const anchor = new Date('2026-06-11T12:00:00Z')
    // Window starts at the start-of-day of (anchor - days + 1)
    // For days=3, anchor=Jun 11: window is Jun 9, Jun 10, Jun 11
    const dates = [new Date('2026-06-09T00:00:00Z')]
    const result = bucketByDay(dates, 3, anchor)
    expect(result[0]).toBe(1)
  })
})
