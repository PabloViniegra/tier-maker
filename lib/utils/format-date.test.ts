import { afterEach, describe, expect, it, vi } from 'vitest'
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
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns Never for null', () => {
    expect(formatRelativeDate(null)).toBe('Never')
  })

  it('formats today in English regardless of the runtime locale', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'))
    expect(formatRelativeDate(new Date('2026-09-01T08:00:00Z'))).toBe('today')
  })

  it('formats relative days in English regardless of the runtime locale', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'))
    expect(formatRelativeDate(new Date('2026-08-27T12:00:00Z'))).toBe(
      '5 days ago'
    )
  })

  it('uses an explicit locale so server and client render the same text', () => {
    const OriginalFormatter = Intl.RelativeTimeFormat
    const locales: Intl.LocalesArgument[] = []
    class TrackingFormatter extends OriginalFormatter {
      constructor(
        locale?: Intl.LocalesArgument,
        options?: Intl.RelativeTimeFormatOptions
      ) {
        locales.push(locale ?? [])
        super(locale, options)
      }
    }
    Object.defineProperty(Intl, 'RelativeTimeFormat', {
      value: TrackingFormatter,
      configurable: true,
    })

    try {
      formatRelativeDate(new Date())
      expect(locales).toEqual(['en-US'])
    } finally {
      Object.defineProperty(Intl, 'RelativeTimeFormat', {
        value: OriginalFormatter,
        configurable: true,
      })
    }
  })
})
