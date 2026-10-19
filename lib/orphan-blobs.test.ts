import { describe, it, expect, vi, beforeEach } from 'vitest'
import { del, list } from '@vercel/blob'
import { db } from '@/lib/db'
import { asMock } from '@/test/as-mock'
import { ORPHAN_GRACE_MS, purgeOrphanBlobs } from './orphan-blobs'

const NOW = new Date('2026-10-19T12:00:00Z')
const OLD = new Date(NOW.getTime() - ORPHAN_GRACE_MS - 1)
const RECENT = new Date(NOW.getTime() - ORPHAN_GRACE_MS + 60_000)
const url = (name: string) =>
  `https://store.public.blob.vercel-storage.com/tier-items/user-1/${name}`

function referenced(...urls: string[]) {
  asMock(db.execute).mockResolvedValue({ rows: urls.map((u) => ({ url: u })) })
}

describe('purgeOrphanBlobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes only old blobs that no tier list references', async () => {
    asMock(list).mockResolvedValue({
      blobs: [
        { url: url('orphan.png'), uploadedAt: OLD },
        { url: url('used.png'), uploadedAt: OLD },
        { url: url('fresh.png'), uploadedAt: RECENT },
      ],
      hasMore: false,
    })
    referenced(url('used.png'))

    const result = await purgeOrphanBlobs(NOW)

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: 'tier-items/' })
    )
    expect(del).toHaveBeenCalledExactlyOnceWith([url('orphan.png')])
    expect(result).toEqual({ deleted: 1 })
  })

  it('follows pagination cursors', async () => {
    asMock(list)
      .mockResolvedValueOnce({
        blobs: [{ url: url('a.png'), uploadedAt: OLD }],
        hasMore: true,
        cursor: 'next',
      })
      .mockResolvedValueOnce({
        blobs: [{ url: url('b.png'), uploadedAt: OLD }],
        hasMore: false,
      })
    referenced()

    await purgeOrphanBlobs(NOW)

    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'next' })
    )
    expect(del).toHaveBeenCalledWith([url('a.png'), url('b.png')])
  })

  it('does not query references or delete when there are no candidates', async () => {
    asMock(list).mockResolvedValue({
      blobs: [{ url: url('fresh.png'), uploadedAt: RECENT }],
      hasMore: false,
    })

    expect(await purgeOrphanBlobs(NOW)).toEqual({ deleted: 0 })
    expect(db.execute).not.toHaveBeenCalled()
    expect(del).not.toHaveBeenCalled()
  })
})
