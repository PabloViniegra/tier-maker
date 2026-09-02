import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  SidebarLogo,
  SidebarNav,
  SidebarUserProfile,
  getInitials,
  navItems,
} from './sidebar-content'

const mockUser = {
  name: 'Pablo García',
  email: 'pablo@example.com',
  image: null,
}

describe('SidebarNav', () => {
  it('renders an Explore link pointing to /dashboard/explore', () => {
    render(<SidebarNav pathname="/dashboard" collapsed={false} />)
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard/explore')
  })

  it('marks Explore active on exact /dashboard/explore', () => {
    render(<SidebarNav pathname="/dashboard/explore" collapsed={false} />)
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toHaveClass('text-foreground')
    expect(link).not.toHaveClass('text-muted-foreground')
  })

  it('marks Explore active on a nested /dashboard/explore/[id] route', () => {
    render(
      <SidebarNav pathname="/dashboard/explore/abc-123" collapsed={false} />
    )
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toHaveClass('text-foreground')
    expect(link).not.toHaveClass('text-muted-foreground')
  })

  it('exposes the active route to assistive technology', () => {
    render(<SidebarNav pathname="/dashboard/explore" collapsed={false} />)
    expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(
      screen.getByRole('link', { name: /^dashboard$/i })
    ).not.toHaveAttribute('aria-current')
  })

  it('exposes the active route when collapsed', () => {
    render(<SidebarNav pathname="/dashboard/explore" collapsed={true} />)
    expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('keeps Dashboard and My Tier Lists links unchanged', () => {
    render(<SidebarNav pathname="/dashboard" collapsed={false} />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard'
    )
    expect(
      screen.getByRole('link', { name: /my tier lists/i })
    ).toHaveAttribute('href', '/dashboard/tier-lists')
  })

  it('does not mark Dashboard active on /dashboard/tier-lists', () => {
    render(<SidebarNav pathname="/dashboard/tier-lists" collapsed={false} />)
    const dashLink = screen.getByRole('link', { name: /^dashboard$/i })
    expect(dashLink).toHaveClass('text-muted-foreground')
    expect(dashLink).not.toHaveClass('text-foreground')
  })

  it('does not render nav labels when collapsed', () => {
    render(<SidebarNav pathname="/dashboard" collapsed={true} />)
    expect(screen.queryAllByTestId('nav-label')).toHaveLength(0)
  })

  it('renders all nav labels when expanded', () => {
    render(<SidebarNav pathname="/dashboard" collapsed={false} />)
    expect(screen.getAllByTestId('nav-label')).toHaveLength(navItems.length)
  })

  it('keeps nav links accessible when collapsed', () => {
    render(<SidebarNav pathname="/dashboard" collapsed={true} />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument()
  })

  it('shows tooltip trigger for Create Tier List when collapsed', () => {
    render(<SidebarNav pathname="/dashboard" collapsed={true} />)
    expect(screen.getByTestId('create-tier-list-trigger')).toBeInTheDocument()
  })
})

describe('SidebarUserProfile', () => {
  it('shows user name and email when expanded', () => {
    render(<SidebarUserProfile user={mockUser} collapsed={false} />)
    expect(screen.getByText('Pablo García')).toBeInTheDocument()
    expect(screen.getByText('pablo@example.com')).toBeInTheDocument()
  })

  it('does not render user name and email when collapsed', () => {
    render(<SidebarUserProfile user={mockUser} collapsed={true} />)
    expect(screen.queryByText('Pablo García')).not.toBeInTheDocument()
    expect(screen.queryByText('pablo@example.com')).not.toBeInTheDocument()
  })

  it('always shows avatar initials', () => {
    render(<SidebarUserProfile user={mockUser} collapsed={true} />)
    expect(screen.getByText('PG')).toBeInTheDocument()
  })
})

describe('SidebarLogo', () => {
  it('renders only the icon by default', () => {
    render(<SidebarLogo />)
    expect(screen.getByTestId('tier-maker-icon')).toBeInTheDocument()
    expect(screen.queryByText('Tier Maker')).not.toBeInTheDocument()
  })

  it('renders the wordmark when requested', () => {
    render(<SidebarLogo showWordmark />)
    expect(screen.getByText('Tier Maker')).toBeInTheDocument()
  })

  it('hides the wordmark when explicitly collapsed', () => {
    render(<SidebarLogo showWordmark={false} />)
    expect(screen.queryByText('Tier Maker')).not.toBeInTheDocument()
  })
})

describe('getInitials', () => {
  it('returns two initials from a multi-word name', () => {
    expect(getInitials('Pablo García', 'p@e.com')).toBe('PG')
  })

  it('returns one initial from a single-word name', () => {
    expect(getInitials('Pablo', 'p@e.com')).toBe('P')
  })

  it('falls back to email initial when name is null', () => {
    expect(getInitials(null, 'pablo@example.com')).toBe('P')
  })

  it('returns empty string when name is null and email is empty', () => {
    expect(getInitials(null, '')).toBe('')
  })
})
