import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

import { getUserTierListStats, getRecentTierLists } from './tier-templates'
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
