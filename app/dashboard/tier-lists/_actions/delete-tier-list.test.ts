import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  mockGetSession,
  mockRevalidatePath,
  mockRevalidateTag,
  mockDelete,
  mockSelect,
  mockDel,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRevalidateTag: vi.fn(),
  mockDelete: vi.fn(),
  mockSelect: vi.fn(),
  mockDel: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }))
vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}))
vi.mock('@vercel/blob', () => ({ del: mockDel }))
vi.mock('@/lib/db', () => ({
  db: {
    delete: mockDelete,
    select: mockSelect,
  },
}))

import { deleteTierList } from './delete-tier-list'

function authedSession(userId = 'user-1') {
  mockGetSession.mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  mockGetSession.mockResolvedValue(null)
}

function mockTemplateFetch(
  sidebarItems: { url?: string }[] = [],
  rows: { items: { url?: string }[] }[] = []
) {
  mockSelect
    .mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ sidebarItems }]),
      }),
    })
    .mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
        }),
      }),
    })
}

function mockNotFoundFetch() {
  mockSelect
    .mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })
    .mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    })
}

function mockOwnedDeletion(templateId = 'tpl-1') {
  mockDelete.mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: templateId }]),
    }),
  })
}

describe('deleteTierList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when unauthenticated', async () => {
    anonSession()
    await expect(deleteTierList('tpl-1')).rejects.toThrow(/auth/i)
  })

  it('throws when tier list belongs to a different user', async () => {
    authedSession('user-other')
    mockNotFoundFetch()
    await expect(deleteTierList('tpl-1')).rejects.toThrow(/not found/i)
  })

  it('returns { ok: true } on successful deletion', async () => {
    authedSession()
    mockTemplateFetch()
    mockOwnedDeletion()

    const result = await deleteTierList('tpl-1')

    expect(result).toEqual({ ok: true })
  })

  it('revalidates dashboard, explore, and public-tier-lists tag after deletion', async () => {
    authedSession()
    mockTemplateFetch()
    mockOwnedDeletion()

    await deleteTierList('tpl-1')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/explore')
    expect(mockRevalidateTag).toHaveBeenCalledWith('public-tier-lists', {})
  })

  it('purges all image URLs from sidebarItems and row items', async () => {
    authedSession()
    mockTemplateFetch(
      [{ url: 'https://blob/a.png' }, { url: 'https://blob/b.png' }],
      [{ items: [{ url: 'https://blob/c.png' }] }]
    )
    mockOwnedDeletion()

    await deleteTierList('tpl-1')

    expect(mockDel).toHaveBeenCalledWith([
      'https://blob/a.png',
      'https://blob/b.png',
      'https://blob/c.png',
    ])
  })

  it('skips blob purge when no images are referenced', async () => {
    authedSession()
    mockTemplateFetch([], [])
    mockOwnedDeletion()

    await deleteTierList('tpl-1')

    expect(mockDel).not.toHaveBeenCalled()
  })

  it('propagates database errors', async () => {
    authedSession()
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('db connection lost')),
      }),
    })
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    await expect(deleteTierList('tpl-1')).rejects.toThrow(/db connection lost/i)
  })
})
