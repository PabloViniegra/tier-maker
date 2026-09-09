import { beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from '@/lib/db'
import { asMock } from '@/test/as-mock'

import { getUserProviderIds } from './user-accounts'

describe('getUserProviderIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the provider ids for the user', async () => {
    asMock(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { providerId: 'credential' },
          { providerId: 'google' },
        ]),
      }),
    })

    await expect(getUserProviderIds('user-1')).resolves.toEqual([
      'credential',
      'google',
    ])
  })
})
