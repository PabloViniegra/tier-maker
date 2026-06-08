import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; fill?: boolean; sizes?: string } & React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button type="button" {...props}>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

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
    expect(screen.getByText(/this-is-a-very-long/)).toBeInTheDocument()
  })

  it('renders the cover image when coverImageUrl is provided', () => {
    render(<TierListCard {...baseProps} coverImageUrl="https://blob/cover.png" />)
    const img = screen.getByRole('img', { name: /my anime rankings/i })
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
  })

  it('renders the first item image as fallback when no cover but firstItemUrl exists', () => {
    render(<TierListCard {...baseProps} firstItemUrl="https://blob/item.png" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://blob/item.png')
  })

  it('cover image takes precedence over firstItemUrl', () => {
    render(
      <TierListCard
        {...baseProps}
        coverImageUrl="https://blob/cover.png"
        firstItemUrl="https://blob/item.png"
      />
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
  })

  it('shows a placeholder with title initials when neither cover nor firstItemUrl is set', () => {
    render(<TierListCard {...baseProps} />)
    const placeholder = screen.getByTestId('card-cover-placeholder')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveTextContent('MA')
  })

  it('renders a context menu trigger button', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByRole('button', { name: /options/i })).toBeInTheDocument()
  })

  it('renders "Edit" link in the card menu', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByRole('link', { name: /^edit$/i })).toBeInTheDocument()
  })

  it('"Edit" links to the edit route', () => {
    render(<TierListCard {...baseProps} />)
    const editLink = screen.getByRole('link', { name: /^edit$/i })
    expect(editLink).toHaveAttribute('href', '/dashboard/tier-lists/abc-123/edit')
  })
})
