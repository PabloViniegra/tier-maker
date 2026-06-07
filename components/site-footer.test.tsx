import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'

import { SiteFooter } from './site-footer'

describe('SiteFooter', () => {
  it('renders the brand wordmark', () => {
    render(<SiteFooter />)
    expect(screen.getAllByText(/tier maker/i).length).toBeGreaterThan(0)
  })

  it('renders navigation links to explore, sign in, and get started', () => {
    render(<SiteFooter />)
    const nav = screen.getByRole('navigation', { name: /footer/i })
    expect(within(nav).getByRole('link', { name: /explore/i })).toHaveAttribute('href', '/explore')
    expect(within(nav).getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
    expect(within(nav).getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register')
  })

  it('renders terms of service and privacy policy triggers', () => {
    render(<SiteFooter />)
    expect(screen.getByRole('button', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /privacy policy/i })).toBeInTheDocument()
  })
})
