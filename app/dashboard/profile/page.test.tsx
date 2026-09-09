import { beforeEach, describe, expect, it } from 'vitest'
import { redirect } from 'next/navigation'

import { asMock } from '@/test/as-mock'
import { getSession } from '@/lib/session'

import ProfilePage from './page'

describe('ProfilePage', () => {
  beforeEach(() => {
    asMock(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  it('redirects to login when there is no session', async () => {
    asMock(getSession).mockResolvedValue(null)

    await expect(ProfilePage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
