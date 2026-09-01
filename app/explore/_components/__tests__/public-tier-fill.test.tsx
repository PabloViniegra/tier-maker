import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { PublicTierFill } from '../public-tier-fill'

const mockData = {
  title: 'Test Tier List',
  description: 'A test description',
  category: 'Games',
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

describe('PublicTierFill', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('renders the tier list title from props', () => {
    render(<PublicTierFill tierId="test-id" data={mockData} />)
    expect(screen.getByText('Test Tier List')).toBeInTheDocument()
  })

  it('renders the Explore back link', () => {
    render(<PublicTierFill tierId="test-id" data={mockData} />)
    expect(screen.getByText('Explore')).toBeInTheDocument()
  })

  it('renders the export button', () => {
    render(<PublicTierFill tierId="test-id" data={mockData} />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('renders the board after hydration', () => {
    render(<PublicTierFill tierId="test-id" data={mockData} />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })
})
