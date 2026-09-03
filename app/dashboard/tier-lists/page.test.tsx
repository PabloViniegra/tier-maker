import { describe, it, expect, vi, beforeEach } from 'vitest'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { asMock } from '@/test/as-mock'
import { TierListsIndexContent } from './page'

describe('TierListsIndexContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    asMock(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  it('redirects to login when there is no session', async () => {
    asMock(getSession).mockResolvedValue(null)

    await expect(TierListsIndexContent()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
