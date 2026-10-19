import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { list } from '@vercel/blob'
import { asMock } from '@/test/as-mock'
import { GET } from './route'

function request(authorization?: string) {
  return new Request('http://localhost/api/cron/orphan-blobs', {
    headers: authorization ? { authorization } : {},
  })
}

describe('GET /api/cron/orphan-blobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CRON_SECRET', 'secret')
    asMock(list).mockResolvedValue({ blobs: [], hasMore: false })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects requests without the cron secret', async () => {
    const res = await GET(request('Bearer wrong'))
    expect(res.status).toBe(401)
    expect(list).not.toHaveBeenCalled()
  })

  it('rejects every request when CRON_SECRET is not configured', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const res = await GET(request('Bearer '))
    expect(res.status).toBe(401)
  })

  it('purges orphan blobs with a valid secret', async () => {
    const res = await GET(request('Bearer secret'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ deleted: 0 })
    expect(list).toHaveBeenCalled()
  })
})
