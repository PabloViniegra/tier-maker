import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserCategoryPresets } from './user-category-presets'
import { db } from '@/lib/db'
import { asMock } from '@/test/as-mock'

describe('getUserCategoryPresets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns presets belonging to the given user', async () => {
    const rows = [
      { id: 'p-1', name: 'Arquitectura' },
      { id: 'p-2', name: 'Filosofía' },
    ]
    asMock(db.select).mockReturnValue({
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
    asMock(db.select).mockReturnValue({
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
