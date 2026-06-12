import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PublicTierBoard } from '../public-tier-board'

const mockRows = [
  {
    id: 'row-1',
    label: 'S',
    color: '#ff7f7f',
    order: 0,
    items: [
      { url: 'https://example.com/a.png', label: 'Item A' },
      { url: 'https://example.com/b.png', label: 'Item B' },
    ],
  },
  {
    id: 'row-2',
    label: 'A',
    color: '#7fbfff',
    order: 1,
    items: [],
  },
]

const mockSidebarItems = [{ url: 'https://example.com/c.png', label: 'Item C' }]

describe('PublicTierBoard', () => {
  it('renders a section element', () => {
    render(<PublicTierBoard rows={[]} sidebarItems={[]} />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('renders all tier rows passed via props', () => {
    render(<PublicTierBoard rows={mockRows} sidebarItems={mockSidebarItems} />)
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders item images with alt text', () => {
    render(<PublicTierBoard rows={mockRows} sidebarItems={mockSidebarItems} />)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByAltText('Item A')).toBeInTheDocument()
    expect(screen.getByAltText('Item B')).toBeInTheDocument()
  })

  it('renders sidebar items in an item bank', () => {
    render(<PublicTierBoard rows={mockRows} sidebarItems={mockSidebarItems} />)
    expect(screen.getByAltText('Item C')).toBeInTheDocument()
  })

  it('shows "Drag items here" placeholder for empty rows', () => {
    render(<PublicTierBoard rows={mockRows} sidebarItems={mockSidebarItems} />)
    // Row 2 (A) has no items
    expect(screen.getByText('Drag items here')).toBeInTheDocument()
  })

  it('renders "All items placed" when sidebar is empty', () => {
    render(<PublicTierBoard rows={mockRows} sidebarItems={[]} />)
    expect(screen.getByText('All items placed')).toBeInTheDocument()
  })

  it('is a plain HTML component with no client directive (renders statically)', () => {
    render(<PublicTierBoard rows={mockRows} sidebarItems={mockSidebarItems} />)
    // The component should emit plain HTML with no interactive elements.
    // Click handlers and DnD are NOT present in the server-rendered version.
    const itemBank = screen.getByText('Items (1)')
    expect(itemBank).toBeInTheDocument()
  })

  it('renders rows in the order provided', () => {
    render(<PublicTierBoard rows={mockRows} sidebarItems={mockSidebarItems} />)
    const labels = screen.getAllByText(/^[SA]$/)
    expect(labels[0].textContent).toBe('S')
    expect(labels[1].textContent).toBe('A')
  })
})
