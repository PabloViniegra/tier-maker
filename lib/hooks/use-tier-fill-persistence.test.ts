import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { useTierEditor } from '@/lib/stores/tier-editor'
import {
  deleteTierFill,
  setTierFill,
  type TierFillDraft,
} from '@/lib/idb/tier-fill-store'
import { useTierFillPersistence } from './use-tier-fill-persistence'

const KEY = 'user-123:test-id'
const seed = {
  title: 'Test Tier List',
  description: 'A test description',
  category: 'Games',
  coverImageUrl: null,
  sidebarItems: [
    { url: 'https://example.com/a.png', label: 'Item A' },
    { url: 'https://example.com/b.png', label: 'Item B' },
  ],
  rows: [{ id: 'row-1', label: 'S', color: '#ff7f7f', order: 0, items: [] }],
}

function PersistenceProbe() {
  const { status } = useTierFillPersistence('test-id', null, seed)
  return createElement('output', null, status)
}

describe('useTierFillPersistence', () => {
  beforeEach(async () => {
    useTierEditor.getState().reset()
    await deleteTierFill(KEY).catch(() => {})
  })

  it('resets the local draft to the published arrangement', async () => {
    const draft: TierFillDraft = {
      rows: [
        {
          id: 'row-1',
          label: 'S',
          color: '#ff7f7f',
          items: [
            {
              id: 'item-a',
              label: 'Item A',
              url: 'https://example.com/a.png',
              status: 'uploaded',
            },
          ],
        },
      ],
      bankItems: [
        {
          id: 'item-b',
          label: 'Item B',
          url: 'https://example.com/b.png',
          status: 'uploaded',
        },
      ],
    }
    await setTierFill(KEY, draft)

    const { result } = renderHook(() =>
      useTierFillPersistence('test-id', 'user-123', seed)
    )

    await waitFor(() => expect(result.current.status).toBe('saved'))
    expect(useTierEditor.getState().rows[0].items).toHaveLength(1)

    let resetResult = false
    await act(async () => {
      resetResult = await result.current.resetDraft()
    })

    expect(resetResult).toBe(true)
    expect(useTierEditor.getState().rows[0].items).toHaveLength(0)
    expect(useTierEditor.getState().bankItems).toHaveLength(2)
  })

  it('preserves the active draft when the server seed gets a new reference', async () => {
    const { rerender, result } = renderHook(
      ({ currentSeed }: { currentSeed: typeof seed }) =>
        useTierFillPersistence('test-id', 'user-123', currentSeed),
      { initialProps: { currentSeed: seed } }
    )

    await waitFor(() => expect(result.current.status).toBe('ready'))

    const draftItem = {
      id: 'draft-item',
      label: 'Draft item',
      url: 'https://example.com/draft.png',
      status: 'uploaded' as const,
    }
    act(() => {
      useTierEditor.setState((state) => ({
        ...state,
        rows: [{ ...state.rows[0], items: [draftItem] }],
      }))
    })

    rerender({ currentSeed: { ...seed } })

    expect(useTierEditor.getState().rows[0].items).toEqual([draftItem])
  })

  it('can render an anonymous visitor on the server without browser storage', () => {
    vi.stubGlobal('localStorage', undefined)

    expect(() => renderToString(createElement(PersistenceProbe))).not.toThrow()

    vi.unstubAllGlobals()
  })
})
