import { describe, it, expect, beforeEach } from 'vitest'
import { useTierEditor } from '../tier-editor'

beforeEach(async () => {
  useTierEditor.getState().reset()
  await useTierEditor.persist.rehydrate()
})

// ── Tracer bullet ────────────────────────────────────────────────────────────

describe('persist middleware — partialize', () => {
  it('writes only metadata, rows, bankItems to localStorage', () => {
    useTierEditor.getState().setMetadata({ title: 'Test Tier' })

    const raw = JSON.parse(localStorage.getItem('tier-editor-draft') ?? 'null')
    expect(raw).not.toBeNull()

    const keys = Object.keys(raw.state)
    expect(keys).toContain('metadata')
    expect(keys).toContain('rows')
    expect(keys).toContain('bankItems')

    expect(keys).not.toContain('setMetadata')
    expect(keys).not.toContain('reset')
    expect(keys).not.toContain('addRow')
  })
})

// ── Rehydration filtering ────────────────────────────────────────────────────

describe('persist middleware — rehydration filters uploading items', () => {
  it('removes uploading items from bankItems', async () => {
    const draft = {
      state: {
        metadata: { title: '', description: '', category: '' },
        rows: [],
        bankItems: [
          { id: 'a', label: 'uploading-img', status: 'uploading' },
          { id: 'b', label: 'done-img', status: 'uploaded', url: 'https://example.com/b.jpg' },
        ],
      },
      version: 0,
    }
    localStorage.setItem('tier-editor-draft', JSON.stringify(draft))
    await useTierEditor.persist.rehydrate()

    const { bankItems } = useTierEditor.getState()
    expect(bankItems).toHaveLength(1)
    expect(bankItems[0].id).toBe('b')
    expect(bankItems.every((i) => i.status !== 'uploading')).toBe(true)
  })

  it('removes uploading items from row items', async () => {
    const draft = {
      state: {
        metadata: { title: '', description: '', category: '' },
        rows: [
          {
            id: 'r1',
            label: 'S',
            color: '#ff0000',
            items: [
              { id: 'x', label: 'pending', status: 'uploading' },
              { id: 'y', label: 'done', status: 'uploaded', url: 'https://example.com/y.jpg' },
            ],
          },
        ],
        bankItems: [],
      },
      version: 0,
    }
    localStorage.setItem('tier-editor-draft', JSON.stringify(draft))
    await useTierEditor.persist.rehydrate()

    const { rows } = useTierEditor.getState()
    expect(rows[0].items).toHaveLength(1)
    expect(rows[0].items[0].id).toBe('y')
  })
})

// ── Reset clears storage ─────────────────────────────────────────────────────

describe('reset()', () => {
  it('removes tier-editor-draft from localStorage', () => {
    useTierEditor.getState().setMetadata({ title: 'dirty' })
    expect(localStorage.getItem('tier-editor-draft')).not.toBeNull()

    useTierEditor.getState().reset()
    expect(localStorage.getItem('tier-editor-draft')).toBeNull()
  })

  it('resets state to empty title and empty bankItems', () => {
    useTierEditor.getState().setMetadata({ title: 'dirty' })
    useTierEditor.getState().reset()

    const { metadata, bankItems } = useTierEditor.getState()
    expect(metadata.title).toBe('')
    expect(bankItems).toHaveLength(0)
  })
})
