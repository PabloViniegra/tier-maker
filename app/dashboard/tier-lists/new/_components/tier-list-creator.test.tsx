import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useTierEditor } from '@/lib/stores/tier-editor'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Droppable: ({ children }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode }) =>
    children({ innerRef: vi.fn(), droppableProps: {}, placeholder: null }, {}),
  Draggable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }),
}))

vi.mock('./metadata-panel', () => ({
  MetadataPanel: () => <div data-testid="metadata-panel" />,
}))
vi.mock('./item-bank', () => ({
  ItemBank: () => <div data-testid="item-bank" />,
}))
vi.mock('./tier-board', () => ({
  TierBoard: () => <div data-testid="tier-board" />,
}))
vi.mock('./save-bar', () => ({
  SaveBar: ({ isSaving }: { isSaving: boolean }) => (
    <button data-testid="save-bar" disabled={isSaving}>Save</button>
  ),
}))

vi.mock('../actions', () => ({
  uploadImagesAction: vi.fn(),
  createTierListAction: vi.fn(),
}))

vi.mock('../../[id]/edit/actions', () => ({
  updateTierListStructureAction: vi.fn(),
}))

import { TierListCreator } from './tier-list-creator'

const baseProps = {
  categoryPresets: ['Anime', 'Cine'],
  userCategoryPresets: [],
}

const seedData = {
  title: 'My Anime Rankings',
  description: 'My picks',
  category: 'Anime',
  coverImageUrl: null,
  sidebarItems: [{ url: 'https://blob/a.png', label: 'Naruto' }],
  rows: [
    { id: 'row-s', label: 'S', color: '#ff0', order: 0, items: [] },
  ],
}

describe('TierListCreator — create mode (no initialData)', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('renders "New tier list" heading', () => {
    render(<TierListCreator {...baseProps} />)
    expect(screen.getByRole('heading', { name: /new tier list/i })).toBeInTheDocument()
  })

  it('back link points to /dashboard', () => {
    render(<TierListCreator {...baseProps} />)
    const back = screen.getByRole('link', { name: /back/i })
    expect(back).toHaveAttribute('href', '/dashboard')
  })
})

describe('TierListCreator — edit mode (with initialData)', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('renders "Edit tier list" heading', () => {
    render(<TierListCreator {...baseProps} initialData={seedData} editId="tpl-1" />)
    expect(screen.getByRole('heading', { name: /edit tier list/i })).toBeInTheDocument()
  })

  it('back link points to /dashboard/tier-lists', () => {
    render(<TierListCreator {...baseProps} initialData={seedData} editId="tpl-1" />)
    const back = screen.getByRole('link', { name: /back/i })
    expect(back).toHaveAttribute('href', '/dashboard/tier-lists')
  })

  it('seeds the store with initialData on mount', () => {
    render(<TierListCreator {...baseProps} initialData={seedData} editId="tpl-1" />)
    const state = useTierEditor.getState()
    expect(state.metadata.title).toBe('My Anime Rankings')
    expect(state.metadata.category).toBe('Anime')
    expect(state.bankItems).toHaveLength(1)
    expect(state.rows).toHaveLength(1)
  })
})
