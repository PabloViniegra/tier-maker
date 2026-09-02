import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTierEditor } from '@/lib/stores/tier-editor'

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
  rows: [{ id: 'row-s', label: 'S', color: '#ff0', order: 0, items: [] }],
}

describe('TierListCreator — create mode (no initialData)', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('renders "New tier list" heading', () => {
    render(<TierListCreator {...baseProps} />)
    expect(
      screen.getByRole('heading', { name: /new tier list/i })
    ).toBeInTheDocument()
  })

  it('back link points to /dashboard', () => {
    render(<TierListCreator {...baseProps} />)
    const back = screen.getByRole('link', { name: /back/i })
    expect(back).toHaveAttribute('href', '/dashboard')
  })

  it('orders image intake before ranking and details', () => {
    render(<TierListCreator {...baseProps} />)

    const itemBank = screen.getByRole('heading', { name: /item bank/i })
    const firstTier = screen.getAllByRole('list')[0]
    const details = screen.getByRole('heading', { name: /details/i })

    expect(itemBank.compareDocumentPosition(firstTier)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(firstTier.compareDocumentPosition(details)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('keeps row controls clear of the label activation area', () => {
    render(<TierListCreator {...baseProps} />)

    for (const control of screen.getAllByLabelText('Change tier color')) {
      expect(control.parentElement).toHaveClass('size-7')
    }
    for (const control of screen.getAllByLabelText('Remove row')) {
      expect(control).toHaveClass('size-7')
    }
    expect(screen.getByRole('button', { name: 'S' })).toHaveClass(
      'relative',
      'z-10'
    )
  })

  it('renames a row without deleting it or opening the color picker', async () => {
    const user = userEvent.setup()
    render(<TierListCreator {...baseProps} />)
    const rowCount = useTierEditor.getState().rows.length

    await user.dblClick(screen.getByRole('button', { name: 'S' }))
    const input = screen.getByLabelText('Edit tier label')
    await user.clear(input)
    await user.type(input, 'God')
    await user.keyboard('{Enter}')

    expect(useTierEditor.getState().rows[0].label).toBe('God')
    expect(useTierEditor.getState().rows).toHaveLength(rowCount)
    expect(screen.getAllByLabelText('Change tier color')[0]).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('clears leftover editor state on mount', () => {
    useTierEditor.getState().setMetadata({ title: 'Stale' })
    render(<TierListCreator {...baseProps} />)
    expect(useTierEditor.getState().metadata.title).toBe('')
  })
})

describe('TierListCreator — edit mode (with initialData)', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('renders "Edit tier list" heading', () => {
    render(
      <TierListCreator {...baseProps} initialData={seedData} editId="tpl-1" />
    )
    expect(
      screen.getByRole('heading', { name: /edit tier list/i })
    ).toBeInTheDocument()
  })

  it('back link points to /dashboard/tier-lists', () => {
    render(
      <TierListCreator {...baseProps} initialData={seedData} editId="tpl-1" />
    )
    const back = screen.getByRole('link', { name: /back/i })
    expect(back).toHaveAttribute('href', '/dashboard/tier-lists')
  })

  it('seeds the store with initialData on mount', () => {
    render(
      <TierListCreator {...baseProps} initialData={seedData} editId="tpl-1" />
    )
    const state = useTierEditor.getState()
    expect(state.metadata.title).toBe('My Anime Rankings')
    expect(state.metadata.category).toBe('Anime')
    expect(state.bankItems).toHaveLength(1)
    expect(state.rows).toHaveLength(1)
  })

  it('resets the store on unmount', () => {
    const { unmount } = render(
      <TierListCreator {...baseProps} initialData={seedData} editId="tpl-1" />
    )
    expect(useTierEditor.getState().metadata.title).toBe('My Anime Rankings')
    unmount()
    expect(useTierEditor.getState().metadata.title).toBe('')
  })
})
