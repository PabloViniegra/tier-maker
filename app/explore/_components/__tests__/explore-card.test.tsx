import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
  } & React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('@/app/explore/_actions/toggle-like', () => ({
  toggleLike: vi.fn(),
}))

import { ExploreCard } from '../explore-card'

const baseData = {
  id: 'xyz-456',
  slug: 'best-anime-ever',
  title: 'Best Anime Ever',
  category: 'anime',
  itemCount: 10,
  createdAt: new Date('2026-06-01T10:00:00Z'),
  creatorName: 'pablo',
  coverImageUrl: null,
  firstItemUrl: null,
  creatorId: 'creator-1',
  likeCount: 7,
}

const baseProps = {
  data: baseData,
  isLiked: false,
  isOwner: false,
  isAuthenticated: true,
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
    render(
      <ExploreCard
        {...baseProps}
        data={{ ...baseData, coverImageUrl: 'https://blob/cover.png' }}
      />
    )
    const img = screen.getByRole('img', { name: /best anime ever/i })
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
  })

  it('renders firstItemUrl as fallback when no cover', () => {
    render(
      <ExploreCard
        {...baseProps}
        data={{ ...baseData, firstItemUrl: 'https://blob/item.png' }}
      />
    )
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

  it('renders like count', () => {
    render(<ExploreCard {...baseProps} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('does not render like button when user is owner', () => {
    render(<ExploreCard {...baseProps} isOwner />)
    expect(
      screen.queryByRole('button', { name: /like/i })
    ).not.toBeInTheDocument()
  })

  it('links to the public slug by default', () => {
    render(<ExploreCard {...baseProps} />)
    expect(screen.getByRole('link', { name: /fill best anime ever/i })).toHaveAttribute(
      'href',
      '/explore/best-anime-ever'
    )
  })

  it('uses the provided href', () => {
    render(<ExploreCard {...baseProps} href="/dashboard/explore/xyz-456" />)
    expect(screen.getByRole('link', { name: /fill best anime ever/i })).toHaveAttribute(
      'href',
      '/dashboard/explore/xyz-456'
    )
  })
})
