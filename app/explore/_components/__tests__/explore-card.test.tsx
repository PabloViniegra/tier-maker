import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { compactRankLabel, ExploreCard } from '../explore-card'

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
  isPublic: true,
  rows: [],
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

  it('exposes the title as a heading', () => {
    render(<ExploreCard {...baseProps} />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Best Anime Ever' })
    ).toBeInTheDocument()
  })

  it('links to the public slug by default', () => {
    render(<ExploreCard {...baseProps} />)
    expect(
      screen.getByRole('link', { name: 'Best Anime Ever' })
    ).toHaveAttribute('href', '/explore/best-anime-ever')
  })

  it('uses the provided href', () => {
    render(<ExploreCard {...baseProps} href="/dashboard/explore/xyz-456" />)
    expect(
      screen.getByRole('link', { name: 'Best Anime Ever' })
    ).toHaveAttribute('href', '/dashboard/explore/xyz-456')
  })

  it('does not render a separate Fill control', () => {
    render(<ExploreCard {...baseProps} />)
    expect(
      screen.queryByRole('link', { name: /fill best anime ever/i })
    ).not.toBeInTheDocument()
  })

  it('hides the mini-board from the accessibility tree', () => {
    render(
      <ExploreCard
        {...baseProps}
        data={{
          ...baseData,
          rows: [
            {
              label: 'S',
              color: 'oklch(0.65 0.22 250)',
              order: 0,
              itemUrls: ['https://blob/item.png'],
            },
          ],
        }}
      />
    )
    expect(screen.getByText('S').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('renders a tier-row preview when rows are provided', () => {
    render(
      <ExploreCard
        {...baseProps}
        data={{
          ...baseData,
          rows: [
            {
              label: 'God tier',
              color: 'oklch(0.65 0.22 250)',
              order: 0,
              itemUrls: ['https://blob/item.png'],
            },
          ],
        }}
      />
    )
    expect(screen.getByText('God')).toBeInTheDocument()
    const thumb = document.querySelector('img[src*="item.png"]')
    expect(thumb).not.toBeNull()
    expect(thumb).toHaveAttribute('src', 'https://blob/item.png')
  })

  it('renders multiple item thumbs in a row', () => {
    render(
      <ExploreCard
        {...baseProps}
        data={{
          ...baseData,
          rows: [
            {
              label: 'S',
              color: 'oklch(0.65 0.22 250)',
              order: 0,
              itemUrls: [
                'https://blob/one.png',
                'https://blob/two.png',
                'https://blob/three.png',
              ],
            },
          ],
        }}
      />
    )
    expect(document.querySelectorAll('img[src*="blob/"]')).toHaveLength(3)
  })

  it('does not render a thumb in an empty row', () => {
    render(
      <ExploreCard
        {...baseProps}
        data={{
          ...baseData,
          rows: [
            {
              label: 'S',
              color: 'oklch(0.65 0.22 250)',
              order: 0,
              itemUrls: [],
            },
          ],
        }}
      />
    )
    expect(document.querySelector('img')).toBeNull()
  })

  it('falls back to cover image when rows are empty', () => {
    render(
      <ExploreCard
        {...baseProps}
        data={{ ...baseData, coverImageUrl: 'https://blob/cover.png' }}
      />
    )
    expect(screen.getByRole('img', { name: /best anime ever/i })).toHaveAttribute(
      'src',
      'https://blob/cover.png'
    )
  })
})

describe('compactRankLabel', () => {
  it('keeps short labels intact', () => {
    expect(compactRankLabel('S')).toBe('S')
    expect(compactRankLabel('GOD')).toBe('GOD')
    expect(compactRankLabel('Tier')).toBe('Tier')
  })

  it('uses the first word when it already fits', () => {
    expect(compactRankLabel('God tier')).toBe('God')
    expect(compactRankLabel('Ni con tu dinero')).toBe('Ni')
    expect(compactRankLabel('Otra fila')).toBe('Otra')
  })

  it('clips long single words without an ellipsis', () => {
    expect(compactRankLabel('Yeppers')).toBe('Yep')
    expect(compactRankLabel('Buenarda')).toBe('Bue')
    expect(compactRankLabel('Mediocre')).toBe('Med')
  })
})
