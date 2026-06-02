import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

import {
  getUserTierListStats,
  getRecentTierLists,
  getAllUserTierLists,
} from './tier-templates'
import { db } from '@/lib/db'

const mockDb = db as unknown as {
  select: ReturnType<typeof vi.fn>
}

describe('getUserTierListStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns zeros and null lastActivity when user has no tier lists', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })

    const result = await getUserTierListStats('user-empty')

    expect(result.total).toBe(0)
    expect(result.categories).toBe(0)
    expect(result.lastActivity).toBeNull()
  })

  it('returns correct total count for user with tier lists', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { total: 3, categories: 2, lastActivity: new Date('2026-06-02') },
        ]),
      }),
    })

    const result = await getUserTierListStats('user-1')

    expect(result.total).toBe(3)
  })

  it('counts distinct categories', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { total: 3, categories: 2, lastActivity: new Date('2026-06-02') },
        ]),
      }),
    })

    const result = await getUserTierListStats('user-1')

    expect(result.categories).toBe(2)
  })

  it('returns the most recent createdAt as lastActivity', async () => {
    const latest = new Date('2026-06-02')
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { total: 3, categories: 2, lastActivity: latest },
        ]),
      }),
    })

    const result = await getUserTierListStats('user-1')

    expect(result.lastActivity).toEqual(latest)
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
        sidebarItems: ['Naruto', 'One Piece'],
        createdAt: new Date('2026-06-01'),
      },
    ]
    mockDb.select.mockReturnValue({
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
        sidebarItems: ['Naruto', 'One Piece', 'Bleach'],
        createdAt: new Date('2026-06-01'),
      },
    ]
    mockDb.select.mockReturnValue({
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
    mockDb.select.mockReturnValue({
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
    mockDb.select.mockReturnValue({
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
    mockDb.select.mockReturnValue({
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
        sidebarItems: ['Naruto', 'Bleach'],
        createdAt: new Date('2026-06-01'),
      },
      {
        id: 'b',
        title: 'Movies',
        category: 'cine',
        sidebarItems: ['Inception'],
        createdAt: new Date('2026-05-15'),
      },
    ]
    const orderBy = vi.fn().mockResolvedValue(rows)
    const where = vi.fn().mockReturnValue({ orderBy })
    const from = vi.fn().mockReturnValue({ where })
    mockDb.select.mockReturnValue({ from })

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
        sidebarItems: ['Naruto', 'Bleach', 'One Piece'],
        createdAt: new Date('2026-06-01'),
      },
    ]
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
        }),
      }),
    })

    const result = await getAllUserTierLists('user-1')

    expect(result[0].itemCount).toBe(3)
  })

  it('returns an empty array when the user has no tier lists', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
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
        sidebarItems: ['a', 'b', 'c', 'd'],
        createdAt: date,
      },
    ]
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
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
    })
  })
})
