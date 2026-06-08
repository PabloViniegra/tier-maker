import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: { src: string; alt: string; fill?: boolean; sizes?: string } & React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

import { ExploreCard } from '../explore-card'

const baseProps = {
  id: 'xyz-456',
  title: 'Best Anime Ever',
  category: 'anime',
  itemCount: 10,
  createdAt: new Date('2026-06-01T10:00:00Z'),
  creatorName: 'pablo',
  coverImageUrl: null,
  firstItemUrl: null,
}

describe('ExploreCard', () => {
  it('renders the title', () => {
    render(<ExploreCard {...baseProps} />)
    expect(screen.getByText('Best Anime Ever')).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<ExploreCard {...baseProps} />)
    expect(screen.getByText('anime')).toBeInTheDocument()
  })

  it('renders creator name', () => {
    render(<ExploreCard {...baseProps} />)
    expect(screen.getByText(/pablo/i)).toBeInTheDocument()
  })

  it('renders cover image when coverImageUrl is provided', () => {
    render(<ExploreCard {...baseProps} coverImageUrl="https://blob/cover.png" />)
    const img = screen.getByRole('img', { name: /best anime ever/i })
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
  })

  it('renders firstItemUrl as fallback when no cover', () => {
    render(<ExploreCard {...baseProps} firstItemUrl="https://blob/item.png" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://blob/item.png')
  })

  it('shows placeholder with title initials when no image is provided', () => {
    render(<ExploreCard {...baseProps} />)
    const placeholder = screen.getByTestId('card-cover-placeholder')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveTextContent('BA')
  })

  it('placeholder uses category-based gradient background', () => {
    render(<ExploreCard {...baseProps} />)
    const placeholder = screen.getByTestId('card-cover-placeholder')
    expect(placeholder.getAttribute('style')).toContain('linear-gradient')
  })
})
