import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PublicTierFill } from '../public-tier-fill'

// Mock child modules that pull in DnD / Zustand
vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  Droppable: ({ children }: any) =>
    children(
      { innerRef: null, droppableProps: {}, placeholder: null },
      { isDraggingOver: false }
    ),
  Draggable: ({ children }: any) =>
    children(
      { innerRef: null, draggableProps: {}, dragHandleProps: {} },
      { isDragging: false }
    ),
}))

vi.mock('@/lib/hooks/use-tier-dnd', () => ({
  useTierDnd: () => ({ onDragEnd: vi.fn() }),
}))

vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({ data: null }),
}))

vi.mock('@/lib/hooks/use-tier-fill-persistence', () => ({
  useTierFillPersistence: vi.fn(),
}))

vi.mock('@/lib/stores/tier-editor', async () => {
  const actual = await vi.importActual('@/lib/stores/tier-editor')
  return {
    ...(actual as object),
    useTierEditor: Object.assign(
      (selector: (s: any) => any) => {
        const state = mockEditorState()
        return selector(state)
      },
      {
        getState: () => mockEditorState(),
        setState: vi.fn(),
        subscribe: vi.fn(() => vi.fn()),
      }
    ),
  }
})

let mockEditorState = vi.fn(() => ({
  rows: [],
  bankItems: [],
}))

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
    mockEditorState = vi.fn(() => ({
      rows: [],
      bankItems: [],
    }))
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

  it('renders the DnD context after hydration', () => {
    render(<PublicTierFill tierId="test-id" data={mockData} />)
    // In jsdom, useEffect fires synchronously during render, so hydration
    // completes immediately and the DnD context is rendered.
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })
})
