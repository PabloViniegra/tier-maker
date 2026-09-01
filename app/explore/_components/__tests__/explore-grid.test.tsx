import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ExploreGrid } from '../explore-grid'

const baseItem = {
  id: '1',
  slug: 'test-list',
  title: 'Test List',
  category: 'games',
  itemCount: 5,
  createdAt: new Date('2026-06-01T10:00:00Z'),
  creatorName: 'pablo',
  coverImageUrl: null,
  firstItemUrl: null,
  creatorId: 'creator-1',
  likeCount: 0,
  isPublic: true,
}

const gridDefaults = {
  q: '',
  category: '',
  sort: 'newest' as const,
  likedIds: [],
  currentUserId: null,
  isAuthenticated: false,
}

describe('ExploreGrid', () => {
  describe('empty state — no filters active', () => {
    it('shows "No public tier lists yet" when items empty and no filters', () => {
      render(<ExploreGrid items={[]} {...gridDefaults} />)
      expect(screen.getByText(/no public tier lists yet/i)).toBeInTheDocument()
    })

    it('does not show a "Clear filters" button when no filters are active', () => {
      render(<ExploreGrid items={[]} {...gridDefaults} />)
      expect(
        screen.queryByRole('link', { name: /clear filters/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('empty state — filters active', () => {
    it('shows "No tier lists match your filters" when q is set', () => {
      render(<ExploreGrid items={[]} {...gridDefaults} q="dragon" />)
      expect(
        screen.getByText(/no tier lists match your filters/i)
      ).toBeInTheDocument()
    })

    it('shows "Clear filters" link when q is active', () => {
      render(<ExploreGrid items={[]} {...gridDefaults} q="dragon" />)
      expect(
        screen.getByRole('link', { name: /clear filters/i })
      ).toBeInTheDocument()
    })

    it('shows "Clear filters" link when category is active', () => {
      render(<ExploreGrid items={[]} {...gridDefaults} category="anime" />)
      expect(
        screen.getByRole('link', { name: /clear filters/i })
      ).toBeInTheDocument()
    })

    it('shows "Clear filters" link when sort is non-default', () => {
      render(<ExploreGrid items={[]} {...gridDefaults} sort="oldest" />)
      expect(
        screen.getByRole('link', { name: /clear filters/i })
      ).toBeInTheDocument()
    })

    it('"Clear filters" link points to /explore with no params', () => {
      render(<ExploreGrid items={[]} {...gridDefaults} q="x" />)
      const link = screen.getByRole('link', { name: /clear filters/i })
      expect(link).toHaveAttribute('href', '/explore')
    })

    it('"Clear filters" link uses clearFiltersHref when provided', () => {
      render(
        <ExploreGrid
          items={[]}
          {...gridDefaults}
          q="x"
          clearFiltersHref="/dashboard/explore"
        />
      )
      const link = screen.getByRole('link', { name: /clear filters/i })
      expect(link).toHaveAttribute('href', '/dashboard/explore')
    })
  })

  describe('with items', () => {
    it('renders a card for each item', () => {
      render(
        <ExploreGrid
          items={[baseItem, { ...baseItem, id: '2', title: 'Another List' }]}
          {...gridDefaults}
        />
      )
      expect(screen.getByText('Test List')).toBeInTheDocument()
      expect(screen.getByText('Another List')).toBeInTheDocument()
    })

    it('builds dashboard fill links from a serializable prefix', () => {
      render(
        <ExploreGrid
          items={[baseItem]}
          {...gridDefaults}
          fillHrefPrefix="/dashboard/explore"
        />
      )

      expect(screen.getByRole('link', { name: /fill test list/i })).toHaveAttribute(
        'href',
        '/dashboard/explore/1'
      )
    })
  })
})
