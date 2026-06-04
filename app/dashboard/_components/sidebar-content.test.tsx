import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SidebarNav } from './sidebar-content'

describe('SidebarNav', () => {
  it('renders an Explore link pointing to /dashboard/explore', () => {
    render(<SidebarNav pathname="/dashboard" />)
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard/explore')
  })

  it('marks Explore active on exact /dashboard/explore', () => {
    render(<SidebarNav pathname="/dashboard/explore" />)
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toHaveClass('text-foreground')
    expect(link).not.toHaveClass('text-muted-foreground')
  })

  it('marks Explore active on a nested /dashboard/explore/[id] route', () => {
    render(<SidebarNav pathname="/dashboard/explore/abc-123" />)
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toHaveClass('text-foreground')
    expect(link).not.toHaveClass('text-muted-foreground')
  })

  it('keeps Dashboard and My Tier Lists links unchanged', () => {
    render(<SidebarNav pathname="/dashboard" />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /my tier lists/i })).toHaveAttribute('href', '/dashboard/tier-lists')
  })
})
