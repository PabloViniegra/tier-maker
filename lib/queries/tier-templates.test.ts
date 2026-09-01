import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUserTierListStats,
  getRecentTierLists,
  getAllUserTierLists,
  getTierListById,
  getPublicTierListBySlug,
} from './tier-templates'
import { db } from '@/lib/db'
import { asMock } from '@/test/as-mock'

function mockStatsQueries<T>(
  aggregateRow: T | undefined,
  recentRows: { createdAt: Date; category: string }[]
) {
  const aggregateRows = aggregateRow ? [aggregateRow] : []
  // First call: aggregate query — where() must be a thenable so .then() works
  const aggregatePromise = Promise.resolve(aggregateRows)
  asMock(db.select).mockReturnValueOnce({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue(aggregatePromise),
    }),
  })
  // Second call: recent rows query — has .limit() before awaiting
  asMock(db.select).mockReturnValueOnce({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(recentRows),
      }),
    }),
  })
}

describe('getUserTierListStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns zeros and null lastActivity when user has no tier lists', async () => {
    mockStatsQueries(undefined, [])

    const result = await getUserTierListStats('user-empty')

    expect(result.total).toBe(0)
    expect(result.categories).toBe(0)
    expect(result.lastActivity).toBeNull()
  })

  it('returns correct all-time total count for user with tier lists', async () => {
    mockStatsQueries(
      { total: 3, categories: 2, lastActivity: new Date('2026-06-02') },
      []
    )

    const result = await getUserTierListStats('user-1')

    expect(result.total).toBe(3)
  })

  it('counts distinct categories (all-time)', async () => {
    mockStatsQueries(
      { total: 3, categories: 2, lastActivity: new Date('2026-06-02') },
      []
    )

    const result = await getUserTierListStats('user-1')

    expect(result.categories).toBe(2)
  })

  it('returns the most recent createdAt as lastActivity', async () => {
    const latest = new Date('2026-06-02')
    mockStatsQueries({ total: 3, categories: 2, lastActivity: latest }, [])

    const result = await getUserTierListStats('user-1')

    expect(result.lastActivity).toEqual(latest)
  })

  it('returns totalSeries array of length 14', async () => {
    mockStatsQueries({ total: 2, categories: 1, lastActivity: new Date() }, [])

    const result = await getUserTierListStats('user-1')

    expect(result.totalSeries).toHaveLength(14)
  })

  it('totalCurrent counts rows created in the current 14-day window', async () => {
    const now = new Date()
    const currentDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const prevDate = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
    mockStatsQueries({ total: 2, categories: 2, lastActivity: now }, [
      { createdAt: currentDate, category: 'anime' },
      { createdAt: prevDate, category: 'games' },
    ])

    const result = await getUserTierListStats('user-1')

    // Only the row in the current window contributes to totalCurrent
    expect(result.totalCurrent).toBe(1)
  })

  it('counts recent rows into totalPrev when they fall in the previous window', async () => {
    const now = new Date()
    // A date 20 days ago falls in the prev window (14–28 days before now)
    const prevDate = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
    mockStatsQueries({ total: 1, categories: 1, lastActivity: now }, [
      { createdAt: prevDate, category: 'anime' },
    ])

    const result = await getUserTierListStats('user-1')

    expect(result.totalPrev).toBe(1)
  })

  it('does not count current-window rows into totalPrev', async () => {
    const now = new Date()
    // A date 3 days ago falls in the current window
    const currentDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    mockStatsQueries({ total: 1, categories: 1, lastActivity: now }, [
      { createdAt: currentDate, category: 'anime' },
    ])

    const result = await getUserTierListStats('user-1')

    expect(result.totalPrev).toBe(0)
  })

  it('delta inputs are window-vs-window: totalCurrent vs totalPrev (not all-time vs prev)', async () => {
    const now = new Date()
    // all-time total = 50, but only 2 created in current window and 3 in prev window
    const currentDates = [
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    ]
    const prevDates = [
      new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    ]
    mockStatsQueries({ total: 50, categories: 10, lastActivity: now }, [
      ...currentDates.map((d) => ({ createdAt: d, category: 'anime' })),
      ...prevDates.map((d) => ({ createdAt: d, category: 'games' })),
    ])

    const result = await getUserTierListStats('user-1')

    // all-time total is preserved for display
    expect(result.total).toBe(50)
    // delta inputs are current-window vs prev-window (not 50 vs 3)
    expect(result.totalCurrent).toBe(2)
    expect(result.totalPrev).toBe(3)
  })

  it('categoriesCurrent counts distinct categories in the current window', async () => {
    const now = new Date()
    const currentRows = [
      {
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        category: 'anime',
      },
      {
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        category: 'anime',
      },
      {
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        category: 'games',
      },
    ]
    mockStatsQueries(
      { total: 3, categories: 2, lastActivity: now },
      currentRows
    )

    const result = await getUserTierListStats('user-1')

    // 2 distinct categories in current window
    expect(result.categoriesCurrent).toBe(2)
  })
})

describe('getRecentTierLists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns tier lists for the given user', async () => {
    const rows = [
      {
        id: 'a',
        title: 'Anime Rankings',
        category: 'anime',
        itemCount: 2,
        createdAt: new Date('2026-06-01'),
      },
    ]
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(rows),
          }),
        }),
      }),
    })

    const result = await getRecentTierLists('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Anime Rankings')
  })

  it('pre-computes itemCount from sidebarItems length', async () => {
    const rows = [
      {
        id: 'a',
        title: 'Anime Rankings',
        category: 'anime',
        itemCount: 3,
        createdAt: new Date('2026-06-01'),
      },
    ]
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(rows),
          }),
        }),
      }),
    })

    const result = await getRecentTierLists('user-1')

    expect(result[0].itemCount).toBe(3)
  })

  it('returns empty array when user has no tier lists', async () => {
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    })

    const result = await getRecentTierLists('user-empty')

    expect(result).toEqual([])
  })

  it('defaults to limit 12', async () => {
    const limitMock = vi.fn().mockResolvedValue([])
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      }),
    })

    await getRecentTierLists('user-1')

    expect(limitMock).toHaveBeenCalledWith(12)
  })

  it('respects custom limit', async () => {
    const limitMock = vi.fn().mockResolvedValue([])
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      }),
    })

    await getRecentTierLists('user-1', 5)

    expect(limitMock).toHaveBeenCalledWith(5)
  })
})

describe('getAllUserTierLists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all tier lists for the given user without a limit', async () => {
    const rows = [
      {
        id: 'a',
        title: 'Anime',
        category: 'anime',
        itemCount: 2,
        createdAt: new Date('2026-06-01'),
      },
      {
        id: 'b',
        title: 'Movies',
        category: 'cine',
        itemCount: 1,
        createdAt: new Date('2026-05-15'),
      },
    ]
    const limit = vi.fn().mockResolvedValue(rows)
    const orderBy = vi.fn().mockReturnValue({ limit })
    const where = vi.fn().mockReturnValue({ orderBy })
    const from = vi.fn().mockReturnValue({ where })
    asMock(db.select).mockReturnValue({ from })

    const result = await getAllUserTierLists('user-1')

    expect(result).toHaveLength(2)
    expect(result.map((r) => r.id)).toEqual(['a', 'b'])
    expect(orderBy).toHaveBeenCalledTimes(1)
  })

  it('pre-computes itemCount from sidebarItems length', async () => {
    const rows = [
      {
        id: 'a',
        title: 'Anime',
        category: 'anime',
        itemCount: 3,
        createdAt: new Date('2026-06-01'),
      },
    ]
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(rows),
          }),
        }),
      }),
    })

    const result = await getAllUserTierLists('user-1')

    expect(result[0].itemCount).toBe(3)
  })

  it('returns an empty array when the user has no tier lists', async () => {
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    })

    const result = await getAllUserTierLists('user-empty')

    expect(result).toEqual([])
  })

  it('maps the row shape to the TierListSummary contract', async () => {
    const date = new Date('2026-06-01')
    const rows = [
      {
        id: 'x',
        title: 'Best Albums',
        category: 'música',
        itemCount: 4,
        coverImageUrl: null,
        firstItemUrl: 'https://blob/a.png',
        createdAt: date,
        likeCount: 3,
      },
    ]
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(rows),
          }),
        }),
      }),
    })

    const result = await getAllUserTierLists('user-1')

    expect(result[0]).toEqual({
      id: 'x',
      title: 'Best Albums',
      category: 'música',
      itemCount: 4,
      createdAt: date,
      coverImageUrl: null,
      firstItemUrl: 'https://blob/a.png',
      likeCount: 3,
    })
  })
})

describe('getTierListById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockTemplate<T>(tpl: T) {
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([tpl]),
      }),
    })
  }

  function mockNoTemplate() {
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })
  }

  function mockRows(rows: object[]) {
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
        }),
      }),
    })
  }

  const baseTpl = {
    id: 'tpl-1',
    title: 'Best Anime',
    description: null,
    category: 'anime',
    sidebarItems: ['https://blob/a.png'],
    createdAt: new Date('2026-06-01'),
    creatorId: 'user-1',
  }

  it('returns full detail with ordered rows when id and userId match', async () => {
    mockTemplate(baseTpl)
    mockRows([
      {
        id: 'row-1',
        label: 'S',
        color: '#ff0',
        order: 0,
        items: ['https://blob/x.png'],
      },
      { id: 'row-2', label: 'A', color: '#0ff', order: 1, items: [] },
    ])

    const result = await getTierListById('tpl-1', 'user-1')

    expect(result).not.toBeNull()
    expect(result!.id).toBe('tpl-1')
    expect(result!.title).toBe('Best Anime')
    expect(result!.rows).toHaveLength(2)
    expect(result!.rows[0]).toMatchObject({
      id: 'row-1',
      label: 'S',
      items: ['https://blob/x.png'],
    })
  })

  it('returns null when the id does not exist', async () => {
    mockNoTemplate()

    const result = await getTierListById('nonexistent', 'user-1')

    expect(result).toBeNull()
  })

  it('returns null when the tier list belongs to a different user', async () => {
    mockNoTemplate()

    const result = await getTierListById('tpl-1', 'user-other')

    expect(result).toBeNull()
  })

  it('exposes sidebarItems as the bank', async () => {
    mockTemplate({
      ...baseTpl,
      sidebarItems: ['https://blob/a.png', 'https://blob/b.png'],
    })
    mockRows([])

    const result = await getTierListById('tpl-1', 'user-1')

    expect(result!.sidebarItems).toEqual([
      'https://blob/a.png',
      'https://blob/b.png',
    ])
  })
})

describe('getPublicTierListBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockTemplate<T>(tpl: T) {
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([tpl]),
        }),
      }),
    })
  }

  function mockNoTemplate() {
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    })
  }

  function mockRows(rows: object[]) {
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
        }),
      }),
    })
  }

  const baseTpl = {
    id: 'tpl-1',
    slug: 'best-anime',
    title: 'Best Anime',
    description: null,
    category: 'anime',
    sidebarItems: ['https://blob/a.png'],
    createdAt: new Date('2026-06-01'),
    creatorId: 'user-1',
    likeCount: 3,
  }

  it('returns full detail when slug matches a public tier list', async () => {
    mockTemplate(baseTpl)
    mockRows([
      {
        id: 'row-1',
        label: 'S',
        color: '#ff0',
        order: 0,
        items: ['https://blob/x.png'],
      },
      { id: 'row-2', label: 'A', color: '#0ff', order: 1, items: [] },
    ])

    const result = await getPublicTierListBySlug('best-anime')

    expect(result).not.toBeNull()
    expect(result!.id).toBe('tpl-1')
    expect(result!.title).toBe('Best Anime')
    expect(result!.likeCount).toBe(3)
    expect(result!.rows).toHaveLength(2)
    expect(result!.rows[0]).toMatchObject({
      id: 'row-1',
      label: 'S',
      items: ['https://blob/x.png'],
    })
  })

  it('returns null when slug does not exist', async () => {
    mockNoTemplate()

    const result = await getPublicTierListBySlug('nonexistent')

    expect(result).toBeNull()
  })

  it('returns null when the tier list is not public (even if slug exists)', async () => {
    mockNoTemplate()

    const result = await getPublicTierListBySlug('private-list')

    expect(result).toBeNull()
  })

  it('returns null when slug exists but template has been deleted', async () => {
    mockNoTemplate()

    const result = await getPublicTierListBySlug('deleted-list')

    expect(result).toBeNull()
  })
})
