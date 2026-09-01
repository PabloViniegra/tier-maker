import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSession } from '@/lib/session'
import { del } from '@vercel/blob'
import { deleteImagesAction } from './delete-images'
import { asMock } from '@/test/as-mock'

const owned =
  'https://store.public.blob.vercel-storage.com/tier-items/user-1/abc.png'
const otherUser =
  'https://store.public.blob.vercel-storage.com/tier-items/user-2/abc.png'

describe('deleteImagesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when unauthenticated', async () => {
    asMock(getSession).mockResolvedValue(null)
    await expect(deleteImagesAction([owned])).rejects.toThrow(/auth/i)
    expect(del).not.toHaveBeenCalled()
  })

  it('throws Forbidden when a URL belongs to another user', async () => {
    asMock(getSession).mockResolvedValue({ user: { id: 'user-1' } })
    await expect(deleteImagesAction([otherUser])).rejects.toThrow(/forbidden/i)
    expect(del).not.toHaveBeenCalled()
  })

  it('purges owned blob URLs', async () => {
    asMock(getSession).mockResolvedValue({ user: { id: 'user-1' } })
    asMock(del).mockResolvedValue(undefined)
    await expect(deleteImagesAction([owned])).resolves.toEqual({ ok: true })
    expect(del).toHaveBeenCalledWith([owned])
  })
})
