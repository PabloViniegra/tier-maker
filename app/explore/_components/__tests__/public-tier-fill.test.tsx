import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { PublicTierFill } from '../public-tier-fill'

const mockData = {
  title: 'Test Tier List',
  description: 'A test description',
  category: 'Games',
  creatorName: 'Test Creator',
  coverImageUrl: null,
  sidebarItems: [{ url: 'https://example.com/item.png', label: 'Test Item' }],
  rows: [
    {
      id: 'row-1',
      label: 'S',
      color: '#ff7f7f',
      order: 0,
      items: [{ url: 'https://example.com/a.png', label: 'Row Item' }],
    },
  ],
}

async function renderPublicTierFill(shareUrl?: string, withLike = false) {
  render(
    <PublicTierFill
      tierId="test-id"
      data={mockData}
      shareUrl={shareUrl}
      like={
        withLike
          ? {
              templateId: 'test-id',
              initialCount: 1,
              initialIsLiked: false,
              isAuthenticated: false,
            }
          : undefined
      }
    />
  )
  await waitFor(() => {
    expect(screen.queryByText('Preparing your list')).not.toBeInTheDocument()
  })
}

describe('PublicTierFill', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('renders the tier list title from props', async () => {
    await renderPublicTierFill()
    expect(screen.getByText('Test Tier List')).toBeInTheDocument()
  })

  it('renders the detail context and placement instructions', async () => {
    await renderPublicTierFill()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText('Games')).toBeInTheDocument()
    expect(screen.getByText('By Test Creator')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
    expect(screen.getByText(/drag an item into a tier/i)).toBeInTheDocument()
  })

  it('renders the Explore back link', async () => {
    await renderPublicTierFill()
    expect(screen.getByText('Explore')).toBeInTheDocument()
  })

  it('renders the export button', async () => {
    await renderPublicTierFill()
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('renders the share button when a public URL is provided', async () => {
    await renderPublicTierFill('/explore/test-tier-list')
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })

  it('groups the detail actions in an accessible compact toolbar', async () => {
    await renderPublicTierFill('/explore/test-tier-list', true)
    const toolbar = screen.getByRole('group', { name: /tier list actions/i })

    expect(
      within(toolbar).getByRole('link', { name: /like/i })
    ).toBeInTheDocument()
    expect(
      within(toolbar).getByRole('button', { name: /share/i })
    ).toBeInTheDocument()
    expect(
      within(toolbar).getByRole('button', { name: /undo last move/i })
    ).toBeInTheDocument()
    expect(
      within(toolbar).getByRole('button', { name: /reset tier list/i })
    ).toBeInTheDocument()
    expect(
      within(toolbar).getByRole('button', { name: /export/i })
    ).toBeInTheDocument()
  })

  it('does not render the share button without a public URL', async () => {
    await renderPublicTierFill()
    expect(
      screen.queryByRole('button', { name: /share/i })
    ).not.toBeInTheDocument()
  })

  it('names the interactive board for assistive technology', async () => {
    await renderPublicTierFill()
    expect(
      screen.getByRole('region', { name: /tier list board/i })
    ).toBeInTheDocument()
  })

  it('renders recovery controls for the fill flow', async () => {
    await renderPublicTierFill()
    expect(
      screen.getByRole('button', { name: /undo last move/i })
    ).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen.getByRole('button', { name: /reset tier list/i })
    ).toBeInTheDocument()
  })

  it('renders the board after hydration', async () => {
    await renderPublicTierFill()
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('renders on the server without browser-only APIs', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('localStorage', undefined)

    try {
      expect(() =>
        renderToString(<PublicTierFill tierId="test-id" data={mockData} />)
      ).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
