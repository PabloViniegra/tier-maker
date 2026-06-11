import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Layers } from 'lucide-react'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState icon={Layers} title="No results" description="Nothing here yet." />)
    expect(screen.getByRole('heading', { name: /no results/i })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<EmptyState icon={Layers} title="No results" description="Nothing here yet." />)
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
  })

  it('renders a link CTA with correct href', () => {
    render(
      <EmptyState
        icon={Layers}
        title="No results"
        description="Nothing here yet."
        cta={{ label: 'Get started', href: '/dashboard' }}
      />
    )
    const link = screen.getByRole('link', { name: /get started/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders a button CTA and fires onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <EmptyState
        icon={Layers}
        title="No results"
        description="Nothing here yet."
        cta={{ label: 'Do it', onClick }}
      />
    )
    const btn = screen.getByRole('button', { name: /do it/i })
    await user.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders without CTA', () => {
    render(<EmptyState icon={Layers} title="No results" description="Nothing here yet." />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
