import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders the back link with correct href', () => {
    render(<PageHeader backHref="/dashboard" title="My Page" />)
    const link = screen.getByRole('link', { name: /back/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders the title as an h1 heading', () => {
    render(<PageHeader backHref="/dashboard" title="My Page" />)
    const heading = screen.getByRole('heading', { level: 1, name: /my page/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders children in the actions slot', () => {
    render(
      <PageHeader backHref="/dashboard" title="My Page">
        <button>Save</button>
      </PageHeader>
    )
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders without children (no actions)', () => {
    render(<PageHeader backHref="/dashboard" title="My Page" />)
    // No button other than the back link
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('truncates long titles visually (line-clamp class present)', () => {
    const { container } = render(
      <PageHeader
        backHref="/dashboard"
        title="A very long title that might overflow the header area"
      />
    )
    const heading = container.querySelector('h1')
    expect(heading?.className).toMatch(/line-clamp/)
  })
})
