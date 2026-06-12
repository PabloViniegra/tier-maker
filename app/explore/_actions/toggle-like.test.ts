import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  mockGetSession,
  mockRevalidateTag,
  mockGetTemplateCreatorId,
  mockGetIsLiked,
  mockInsert,
  mockDelete,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockRevalidateTag: vi.fn(),
  mockGetTemplateCreatorId: vi.fn(),
  mockGetIsLiked: vi.fn(),
  mockInsert: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }))
vi.mock('next/cache', () => ({ revalidateTag: mockRevalidateTag }))
vi.mock('@/lib/queries/tier-templates', () => ({
  getTemplateCreatorId: mockGetTemplateCreatorId,
}))
vi.mock('@/lib/queries/tier-likes', () => ({
  getIsLiked: mockGetIsLiked,
}))
vi.mock('@/lib/db', () => ({
  db: {
    insert: mockInsert,
    delete: mockDelete,
  },
}))

import { toggleLike } from './toggle-like'

function authed(userId = 'user-1') {
  mockGetSession.mockResolvedValue({ user: { id: userId } })
}

function anon() {
  mockGetSession.mockResolvedValue(null)
}

function templateOwnedBy(userId: string) {
  mockGetTemplateCreatorId.mockResolvedValue(userId)
}

function notLiked() {
  mockGetIsLiked.mockResolvedValue(false)
}

function alreadyLiked() {
  mockGetIsLiked.mockResolvedValue(true)
}

function mockInsertChain() {
  mockInsert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
    }),
  })
}

function mockDeleteChain() {
  mockDelete.mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  })
}

describe('toggleLike', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when unauthenticated', async () => {
    anon()
    await expect(toggleLike('tpl-1')).rejects.toThrow(/auth/i)
  })

  it('throws when user tries to like their own tier list', async () => {
    authed('user-1')
    templateOwnedBy('user-1')
    await expect(toggleLike('tpl-1')).rejects.toThrow(/own/i)
  })

  it('inserts a like when not yet liked', async () => {
    authed('user-1')
    templateOwnedBy('user-2')
    notLiked()
    mockInsertChain()

    const result = await toggleLike('tpl-1')

    expect(mockInsert).toHaveBeenCalled()
    expect(result).toEqual({ liked: true })
  })

  it('deletes the like when already liked', async () => {
    authed('user-1')
    templateOwnedBy('user-2')
    alreadyLiked()
    mockDeleteChain()

    const result = await toggleLike('tpl-1')

    expect(mockDelete).toHaveBeenCalled()
    expect(result).toEqual({ liked: false })
  })

  it('revalidates public-tier-lists tag after toggling', async () => {
    authed('user-1')
    templateOwnedBy('user-2')
    notLiked()
    mockInsertChain()

    await toggleLike('tpl-1')

    expect(mockRevalidateTag).toHaveBeenCalledWith('public-tier-lists', {})
  })

  it('throws when template does not exist', async () => {
    authed('user-1')
    mockGetTemplateCreatorId.mockResolvedValue(null)
    await expect(toggleLike('tpl-nonexistent')).rejects.toThrow(/not found/i)
  })
})
