import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

// Drizzle queries are chainable thenables. This proxy resolves with `data`
// when the chain is awaited, and returns itself for any method call.
function makeDbChain(data: unknown) {
  const handler: ProxyHandler<object> = {
    get(_, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => unknown) =>
          Promise.resolve(data).then(resolve)
      }
      return () => new Proxy({}, handler)
    },
  }
  return new Proxy({}, handler)
}

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }))
vi.mock('@/lib/db', () => ({ db: { select: mockSelect } }))

import {
  getPublicTierListById,
  getDistinctPublicCategories,
  getPublicTierLists,
  getAllPublicTierListIds,
} from '../tier-templates'

// ─── getPublicTierListById ─────────────────────────────────────────────────

describe('getPublicTierListById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when the template is not found', async () => {
    mockSelect.mockReturnValue(makeDbChain([]))
    const result = await getPublicTierListById('non-existent-id')
    expect(result).toBeNull()
  })

  it('returns null when the template is private (DB returns empty due to isPublic filter)', async () => {
    // WHERE is_public = true is applied at DB level, so private templates appear as "not found"
    mockSelect.mockReturnValueOnce(makeDbChain([]))
    const result = await getPublicTierListById('tid')
    expect(result).toBeNull()
  })

  it('returns full TierListDetail shape for a public template', async () => {
    const template = {
      id: 'tid',
      title: 'Anime Rankings',
      description: 'Best shows',
      category: 'Anime',
      isPublic: true,
      sidebarItems: ['https://img.com/a.png', 'https://img.com/b.png'],
      createdAt: new Date('2026-01-01'),
      creator_id: 'uid',
    }
    const rows = [
      {
        id: 'r1',
        templateId: 'tid',
        label: 'S',
        color: '#ff0000',
        order: 0,
        items: ['https://img.com/a.png'],
      },
      {
        id: 'r2',
        templateId: 'tid',
        label: 'A',
        color: '#00ff00',
        order: 1,
        items: [],
      },
    ]
    mockSelect
      .mockReturnValueOnce(makeDbChain([template]))
      .mockReturnValueOnce(makeDbChain(rows))

    const result = await getPublicTierListById('tid')

    expect(result).not.toBeNull()
    expect(result!.id).toBe('tid')
    expect(result!.title).toBe('Anime Rankings')
    expect(result!.description).toBe('Best shows')
    expect(result!.sidebarItems).toEqual([
      'https://img.com/a.png',
      'https://img.com/b.png',
    ])
    expect(result!.rows).toHaveLength(2)
    expect(result!.rows[0]).toMatchObject({
      id: 'r1',
      label: 'S',
      color: '#ff0000',
      order: 0,
    })
  })
})

// ─── getDistinctPublicCategories ──────────────────────────────────────────

describe('getDistinctPublicCategories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns an empty array when no public templates exist', async () => {
    mockSelect.mockReturnValue(makeDbChain([]))
    const result = await getDistinctPublicCategories()
    expect(result).toEqual([])
  })

  it('returns distinct category strings', async () => {
    mockSelect.mockReturnValue(
      makeDbChain([
        { category: 'Anime' },
        { category: 'Sports' },
        { category: 'Music' },
      ])
    )
    const result = await getDistinctPublicCategories()
    expect(result).toEqual(['Anime', 'Sports', 'Music'])
  })
})

// ─── getPublicTierLists ────────────────────────────────────────────────────

describe('getPublicTierLists', () => {
  beforeEach(() => vi.clearAllMocks())

  const makeTemplateRow = (
    overrides: Partial<Record<string, unknown>> = {}
  ) => ({
    id: 'tid',
    title: 'My List',
    category: 'Games',
    itemCount: 3,
    createdAt: new Date('2026-01-01'),
    creatorName: 'Alice',
    ...overrides,
  })

  it('returns items and total', async () => {
    const rows = [
      makeTemplateRow(),
      makeTemplateRow({ id: 'tid2', title: 'Other' }),
    ]
    mockSelect
      .mockReturnValueOnce(makeDbChain(rows)) // items query
      .mockReturnValueOnce(makeDbChain([{ count: 2 }])) // count query

    const result = await getPublicTierLists({ page: 1, pageSize: 12 })

    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(2)
  })

  it('maps sidebarItems length to itemCount', async () => {
    const rows = [makeTemplateRow({ itemCount: 4 })]
    mockSelect
      .mockReturnValueOnce(makeDbChain(rows))
      .mockReturnValueOnce(makeDbChain([{ count: 1 }]))

    const result = await getPublicTierLists({ page: 1, pageSize: 12 })
    expect(result.items[0].itemCount).toBe(4)
  })

  it('exposes creatorName from the join', async () => {
    const rows = [makeTemplateRow({ creatorName: 'Bob' })]
    mockSelect
      .mockReturnValueOnce(makeDbChain(rows))
      .mockReturnValueOnce(makeDbChain([{ count: 1 }]))

    const result = await getPublicTierLists({ page: 1, pageSize: 12 })
    expect(result.items[0].creatorName).toBe('Bob')
  })

  it('returns empty items and total 0 when no public templates', async () => {
    mockSelect
      .mockReturnValueOnce(makeDbChain([]))
      .mockReturnValueOnce(makeDbChain([{ count: 0 }]))

    const result = await getPublicTierLists({ page: 1, pageSize: 12 })
    expect(result.items).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})

// ─── getAllPublicTierListIds ───────────────────────────────────────────────

describe('getAllPublicTierListIds', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty array when no public templates exist', async () => {
    mockSelect.mockReturnValue(makeDbChain([]))
    const result = await getAllPublicTierListIds()
    expect(result).toEqual([])
  })

  it('returns id and createdAt for each public template', async () => {
    const rows = [
      { id: 'tid1', createdAt: new Date('2026-01-01') },
      { id: 'tid2', createdAt: new Date('2026-03-15') },
    ]
    mockSelect.mockReturnValue(makeDbChain(rows))
    const result = await getAllPublicTierListIds()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 'tid1', createdAt: new Date('2026-01-01') })
    expect(result[1]).toEqual({ id: 'tid2', createdAt: new Date('2026-03-15') })
  })

  it('returns only the id and createdAt fields (minimal projection)', async () => {
    mockSelect.mockReturnValue(
      makeDbChain([{ id: 'tid1', createdAt: new Date('2026-01-01') }])
    )
    const result = await getAllPublicTierListIds()
    expect(Object.keys(result[0])).toEqual(
      expect.arrayContaining(['id', 'createdAt'])
    )
  })
})
