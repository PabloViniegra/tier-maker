import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockSelect } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: { select: mockSelect },
}))

import { getUserLikedTemplateIds, getIsLiked } from './tier-likes'

function mockSelectResult(rows: unknown[]) {
  mockSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(rows),
      }),
    }),
  })
}

function mockSelectResultNoLimit(rows: unknown[]) {
  mockSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(rows),
    }),
  })
}

describe('getUserLikedTemplateIds', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns an array of template IDs liked by the user', async () => {
    mockSelectResultNoLimit([
      { templateId: 'tpl-a' },
      { templateId: 'tpl-b' },
    ])

    const result = await getUserLikedTemplateIds('user-1')
    expect(result).toEqual(['tpl-a', 'tpl-b'])
  })

  it('returns an empty array when the user has no likes', async () => {
    mockSelectResultNoLimit([])

    const result = await getUserLikedTemplateIds('user-1')
    expect(result).toEqual([])
  })

  it('scopes the query when templateIds are provided', async () => {
    mockSelectResultNoLimit([{ templateId: 'tpl-a' }])

    const result = await getUserLikedTemplateIds('user-1', ['tpl-a', 'tpl-b', 'tpl-c'])
    expect(result).toEqual(['tpl-a'])
  })

  it('returns empty array when templateIds is empty array', async () => {
    mockSelectResultNoLimit([])

    const result = await getUserLikedTemplateIds('user-1', [])
    expect(result).toEqual([])
  })
})

describe('getIsLiked', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns true when the user has liked the template', async () => {
    mockSelectResult([{ templateId: 'tpl-1' }])

    const result = await getIsLiked('user-1', 'tpl-1')
    expect(result).toBe(true)
  })

  it('returns false when the user has not liked the template', async () => {
    mockSelectResult([])

    const result = await getIsLiked('user-1', 'tpl-1')
    expect(result).toBe(false)
  })
})
