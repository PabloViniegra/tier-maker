import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

import { getUserCategoryPresets } from './user-category-presets'
import { db } from '@/lib/db'

const mockDb = db as unknown as { select: ReturnType<typeof vi.fn> }

describe('getUserCategoryPresets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns presets belonging to the given user', async () => {
    const rows = [
      { id: 'p-1', name: 'Arquitectura' },
      { id: 'p-2', name: 'Filosofía' },
    ]
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
        }),
      }),
    })

    const result = await getUserCategoryPresets('user-1')

    expect(result).toEqual(rows)
  })

  it('returns empty array when user has no saved presets', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    const result = await getUserCategoryPresets('user-empty')

    expect(result).toEqual([])
  })
})
