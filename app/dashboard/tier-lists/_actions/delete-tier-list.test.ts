import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockGetSession, mockRevalidatePath, mockRevalidateTag, mockDelete } =
  vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockRevalidateTag: vi.fn(),
    mockDelete: vi.fn(),
  }))

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }))
vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}))
vi.mock('@/lib/db', () => ({
  db: {
    delete: mockDelete,
  },
}))

import { deleteTierList } from './delete-tier-list'

function authedSession(userId = 'user-1') {
  mockGetSession.mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  mockGetSession.mockResolvedValue(null)
}

function mockOwnedDeletion(templateId = 'tpl-1') {
  mockDelete.mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: templateId }]),
    }),
  })
}

function mockNotOwnedDeletion() {
  mockDelete.mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
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
    mockNotOwnedDeletion()
    await expect(deleteTierList('tpl-1')).rejects.toThrow(/not found/i)
  })

  it('returns { ok: true } on successful deletion', async () => {
    authedSession()
    mockOwnedDeletion()

    const result = await deleteTierList('tpl-1')

    expect(result).toEqual({ ok: true })
  })

  it('revalidates dashboard, explore, and public-tier-lists tag after deletion', async () => {
    authedSession()
    mockOwnedDeletion()

    await deleteTierList('tpl-1')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/explore')
    expect(mockRevalidateTag).toHaveBeenCalledWith('public-tier-lists', {})
  })

  it('propagates database errors', async () => {
    authedSession()
    mockDelete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error('db connection lost')),
      }),
    })

    await expect(deleteTierList('tpl-1')).rejects.toThrow(/db connection lost/i)
  })
})
