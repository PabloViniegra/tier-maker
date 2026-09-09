import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import { RelativeDate } from './relative-date'

describe('RelativeDate', () => {
  it('renders a stable absolute date on the server', () => {
    const markup = renderToString(
      <RelativeDate date="2026-09-01T08:00:00.000Z" />
    )

    expect(markup).toContain('September 1, 2026')
  })

  it('renders the relative date after hydration', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T12:00:00.000Z'))

    try {
      render(<RelativeDate date="2026-09-01T08:00:00.000Z" />)
      expect(screen.getByText('today')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
