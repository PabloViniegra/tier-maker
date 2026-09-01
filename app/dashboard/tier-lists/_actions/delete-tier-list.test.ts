import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSession } from '@/lib/session'
import { revalidatePath, revalidateTag } from 'next/cache'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import { deleteTierList } from './delete-tier-list'
import { asMock } from '@/test/as-mock'

function authedSession(userId = 'user-1') {
  asMock(getSession).mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  asMock(getSession).mockResolvedValue(null)
}

function mockTemplateFetch(
  sidebarItems: { url?: string }[] = [],
  rows: { items: { url?: string }[] }[] = [],
  coverImageUrl: string | null = null
) {
  asMock(db.select)
    .mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ sidebarItems, coverImageUrl }]),
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
  asMock(db.select)
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
  asMock(db.delete).mockReturnValue({
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

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists')
    expect(revalidatePath).toHaveBeenCalledWith('/explore', 'layout')
    expect(revalidateTag).toHaveBeenCalledWith('public-tier-lists', {})
    expect(revalidateTag).toHaveBeenCalledWith('public-categories', {})
  })

  it('purges owned cover, sidebar, and row image URLs', async () => {
    authedSession()
    const cover =
      'https://store.public.blob.vercel-storage.com/tier-items/user-1/cover.png'
    const a =
      'https://store.public.blob.vercel-storage.com/tier-items/user-1/a.png'
    const b =
      'https://store.public.blob.vercel-storage.com/tier-items/user-1/b.png'
    const c =
      'https://store.public.blob.vercel-storage.com/tier-items/user-1/c.png'
    mockTemplateFetch([{ url: a }, { url: b }], [{ items: [{ url: c }] }], cover)
    mockOwnedDeletion()

    await deleteTierList('tpl-1')

    expect(del).toHaveBeenCalledWith([cover, a, b, c])
  })

  it('does not purge blob URLs owned by another user', async () => {
    authedSession()
    const own =
      'https://store.public.blob.vercel-storage.com/tier-items/user-1/a.png'
    const planted =
      'https://store.public.blob.vercel-storage.com/tier-items/user-2/x.png'
    mockTemplateFetch([{ url: own }, { url: planted }])
    mockOwnedDeletion()

    await deleteTierList('tpl-1')

    expect(del).toHaveBeenCalledWith([own])
  })

  it('skips blob purge when no images are referenced', async () => {
    authedSession()
    mockTemplateFetch([], [])
    mockOwnedDeletion()

    await deleteTierList('tpl-1')

    expect(del).not.toHaveBeenCalled()
  })

  it('propagates database errors', async () => {
    authedSession()
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('db connection lost')),
      }),
    })
    asMock(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    await expect(deleteTierList('tpl-1')).rejects.toThrow(/db connection lost/i)
  })
})
