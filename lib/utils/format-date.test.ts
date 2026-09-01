import { describe, expect, it } from 'vitest'
import {
  formatLongDate,
  formatRelativeDate,
  LEGAL_UPDATED_AT,
} from './format-date'

describe('formatLongDate', () => {
  it('formats the legal update date with Intl', () => {
    expect(formatLongDate(LEGAL_UPDATED_AT)).toBe('June 7, 2026')
  })
})

describe('formatRelativeDate', () => {
  it('returns Never for null', () => {
    expect(formatRelativeDate(null)).toBe('Never')
  })

  it('uses Intl.RelativeTimeFormat for today', () => {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
    expect(formatRelativeDate(new Date())).toBe(rtf.format(0, 'day'))
  })

  it('uses Intl.RelativeTimeFormat for days ago', () => {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    expect(formatRelativeDate(fiveDaysAgo)).toBe(rtf.format(-5, 'day'))
  })
})
