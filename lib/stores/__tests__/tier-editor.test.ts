import { describe, it, expect, beforeEach } from 'vitest'
import { useTierEditor } from '../tier-editor'

beforeEach(() => {
  useTierEditor.getState().reset()
})

// ── reset() ──────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('resets state to empty title and empty bankItems', () => {
    useTierEditor.getState().setMetadata({ title: 'dirty' })
    useTierEditor.getState().reset()

    const { metadata, bankItems } = useTierEditor.getState()
    expect(metadata.title).toBe('')
    expect(bankItems).toHaveLength(0)
  })

  it('restores default rows after reset', () => {
    useTierEditor.getState().addRow()
    useTierEditor.getState().reset()

    const { rows } = useTierEditor.getState()
    // Default rows defined by defaultTierRows() — at least 1
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((r) => r.items.length === 0)).toBe(true)
  })
})

// ── initFromDb() ──────────────────────────────────────────────────────────────

describe('initFromDb()', () => {
  it('seeds metadata from server data', () => {
    useTierEditor.getState().initFromDb({
      title: 'My Tier',
      description: 'desc',
      category: 'games',
      coverImageUrl: 'https://img/cover.jpg',
      sidebarItems: [],
      rows: [],
    })

    const { metadata } = useTierEditor.getState()
    expect(metadata.title).toBe('My Tier')
    expect(metadata.description).toBe('desc')
    expect(metadata.category).toBe('games')
    expect(metadata.coverImageUrl).toBe('https://img/cover.jpg')
  })

  it('populates bankItems from sidebarItems', () => {
    useTierEditor.getState().initFromDb({
      title: 'T',
      description: null,
      category: 'c',
      coverImageUrl: null,
      sidebarItems: [
        { url: 'https://img/a.jpg', label: 'A' },
        { url: 'https://img/b.jpg', label: 'B' },
      ],
      rows: [],
    })

    const { bankItems } = useTierEditor.getState()
    expect(bankItems).toHaveLength(2)
    expect(bankItems.every((i) => i.status === 'uploaded')).toBe(true)
  })

  it('populates rows with items from seed', () => {
    useTierEditor.getState().initFromDb({
      title: 'T',
      description: null,
      category: 'c',
      coverImageUrl: null,
      sidebarItems: [],
      rows: [
        {
          id: 'r1',
          label: 'S',
          color: '#f00',
          order: 0,
          items: [{ url: 'https://img/x.jpg', label: 'X' }],
        },
      ],
    })

    const { rows } = useTierEditor.getState()
    expect(rows).toHaveLength(1)
    expect(rows[0].items).toHaveLength(1)
    expect(rows[0].items[0].status).toBe('uploaded')
  })
})
