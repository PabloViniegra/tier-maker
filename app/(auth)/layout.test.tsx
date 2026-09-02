import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import AuthLayout from './layout'

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  })
})

describe('AuthLayout', () => {
  it('links the wordmark home', () => {
    render(
      <AuthLayout>
        <p>child</p>
      </AuthLayout>
    )
    const marks = screen.getAllByRole('link', { name: /tier maker/i })
    expect(marks.length).toBeGreaterThan(0)
    for (const mark of marks) {
      expect(mark).toHaveAttribute('href', '/')
    }
  })

  it('shows a ranking preview with items, not empty tracks', () => {
    render(
      <AuthLayout>
        <p>child</p>
      </AuthLayout>
    )
    expect(screen.getAllByText('Interstellar').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Arrival').length).toBeGreaterThan(0)
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
    expect(screen.queryByText('Dune')).not.toBeInTheDocument()
  })
})
