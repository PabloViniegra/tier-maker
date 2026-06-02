import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TierListCard } from './tier-list-card'

const baseProps = {
  id: 'abc-123',
  title: 'My Anime Rankings',
  category: 'anime',
  itemCount: 23,
  createdAt: new Date('2026-06-01T10:00:00Z'),
}

describe('TierListCard', () => {
  it('renders the title', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByText('My Anime Rankings')).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByText('anime')).toBeInTheDocument()
  })

  it('renders the item count', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByText('23 items')).toBeInTheDocument()
  })

  it('renders "1 item" (singular) when itemCount is 1', () => {
    render(<TierListCard {...baseProps} itemCount={1} />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('renders "0 items" when itemCount is 0', () => {
    render(<TierListCard {...baseProps} itemCount={0} />)
    expect(screen.getByText('0 items')).toBeInTheDocument()
  })

  it('renders an Open button', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByRole('link', { name: /open/i })).toBeInTheDocument()
  })

  it('Open button links to the tier list detail route', () => {
    render(<TierListCard {...baseProps} />)
    const link = screen.getByRole('link', { name: /open/i })
    expect(link).toHaveAttribute('href', '/dashboard/tier-lists/abc-123')
  })

  it('truncates long category names in the badge', () => {
    render(
      <TierListCard
        {...baseProps}
        category="this-is-a-very-long-category-name-that-exceeds-limit"
      />
    )
    const badge = screen.getByText(/this-is-a-very-long/)
    expect(badge).toBeInTheDocument()
  })
})
