import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { CookieBanner } from '@/components/cookie-banner'
import { useConsentStore } from '@/lib/stores/consent'
import { asMock } from '@/test/as-mock'

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    useConsentStore.setState({ status: 'pending' })
    asMock(usePathname).mockReturnValue('/')
  })

  afterEach(() => {
    localStorage.clear()
    useConsentStore.setState({ status: 'pending' })
    asMock(usePathname).mockReturnValue('/')
  })

  it('renders consent actions on public pages', () => {
    render(<CookieBanner />)
    expect(
      screen.getByRole('dialog', { name: /cookie consent/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
  })

  it('does not render on the login page', () => {
    asMock(usePathname).mockReturnValue('/login')
    render(<CookieBanner />)
    expect(
      screen.queryByRole('dialog', { name: /cookie consent/i })
    ).not.toBeInTheDocument()
  })

  it('does not render on other auth routes', () => {
    asMock(usePathname).mockReturnValue('/register')
    render(<CookieBanner />)
    expect(
      screen.queryByRole('dialog', { name: /cookie consent/i })
    ).not.toBeInTheDocument()
  })
})
