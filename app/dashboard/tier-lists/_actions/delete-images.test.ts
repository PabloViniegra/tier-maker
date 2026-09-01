import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockGetSession, mockDel } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockDel: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }))
vi.mock('@vercel/blob', () => ({ del: mockDel }))

import { deleteImagesAction } from './delete-images'

const owned =
  'https://store.public.blob.vercel-storage.com/tier-items/user-1/abc.png'
const otherUser =
  'https://store.public.blob.vercel-storage.com/tier-items/user-2/abc.png'

describe('deleteImagesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    await expect(deleteImagesAction([owned])).rejects.toThrow(/auth/i)
    expect(mockDel).not.toHaveBeenCalled()
  })

  it('throws Forbidden when a URL belongs to another user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } })
    await expect(deleteImagesAction([otherUser])).rejects.toThrow(/forbidden/i)
    expect(mockDel).not.toHaveBeenCalled()
  })

  it('purges owned blob URLs', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockDel.mockResolvedValue(undefined)
    await expect(deleteImagesAction([owned])).resolves.toEqual({ ok: true })
    expect(mockDel).toHaveBeenCalledWith([owned])
  })
})
