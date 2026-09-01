import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSession } from '@/lib/session'
import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { toggleLike } from './toggle-like'
import { asMock } from '@/test/as-mock'

function authed(userId = 'user-1') {
  asMock(getSession).mockResolvedValue({ user: { id: userId } })
}

function anon() {
  asMock(getSession).mockResolvedValue(null)
}

function selectLimitResult<T>(rows: T[]) {
  return {
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(rows),
      }),
    }),
  }
}

function templateOwnedBy(userId: string) {
  asMock(db.select).mockReturnValueOnce(
    selectLimitResult([{ creatorId: userId }])
  )
}

function notLiked() {
  asMock(db.select).mockReturnValueOnce(selectLimitResult([]))
}

function alreadyLiked() {
  asMock(db.select).mockReturnValueOnce(
    selectLimitResult([{ templateId: 'tpl-1' }])
  )
}

function mockInsertChain() {
  asMock(db.insert).mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
    }),
  })
}

function mockDeleteChain() {
  asMock(db.delete).mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  })
}

describe('toggleLike', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    asMock(db.select).mockReset()
    asMock(db.insert).mockReset()
    asMock(db.delete).mockReset()
  })

  it('throws when unauthenticated', async () => {
    anon()
    await expect(toggleLike('tpl-1')).rejects.toThrow(/auth/i)
  })

  it('throws when user tries to like their own tier list', async () => {
    authed('user-1')
    asMock(db.select).mockReturnValue(
      selectLimitResult([{ creatorId: 'user-1' }])
    )
    await expect(toggleLike('tpl-1')).rejects.toThrow(/own/i)
  })

  it('inserts a like when not yet liked', async () => {
    authed('user-1')
    templateOwnedBy('user-2')
    notLiked()
    mockInsertChain()

    const result = await toggleLike('tpl-1')

    expect(db.insert).toHaveBeenCalled()
    expect(result).toEqual({ liked: true })
  })

  it('deletes the like when already liked', async () => {
    authed('user-1')
    templateOwnedBy('user-2')
    alreadyLiked()
    mockDeleteChain()

    const result = await toggleLike('tpl-1')

    expect(db.delete).toHaveBeenCalled()
    expect(result).toEqual({ liked: false })
  })

  it('revalidates public-tier-lists tag after toggling', async () => {
    authed('user-1')
    templateOwnedBy('user-2')
    notLiked()
    mockInsertChain()

    await toggleLike('tpl-1')

    expect(revalidateTag).toHaveBeenCalledWith('public-tier-lists', {})
  })

  it('throws when template does not exist', async () => {
    authed('user-1')
    asMock(db.select).mockReturnValue(selectLimitResult([]))
    await expect(toggleLike('tpl-nonexistent')).rejects.toThrow(/not found/i)
  })
})
