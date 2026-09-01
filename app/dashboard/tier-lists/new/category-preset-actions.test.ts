import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import {
  saveUserCategoryPresetAction,
  deleteUserCategoryPresetAction,
} from './actions'
import { asMock } from '@/test/as-mock'

function authedSession(userId = 'user-1') {
  asMock(getSession).mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  asMock(getSession).mockResolvedValue(null)
}

describe('saveUserCategoryPresetAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requires authentication', async () => {
    anonSession()
    await expect(saveUserCategoryPresetAction('Arquitectura')).rejects.toThrow(
      /auth/i
    )
  })

  it('inserts preset for authenticated user and returns it', async () => {
    authedSession()
    const preset = { id: 'p-1', name: 'Arquitectura' }
    asMock(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([preset]),
        }),
      }),
    })

    const result = await saveUserCategoryPresetAction('Arquitectura')

    expect(result).toEqual(preset)
  })

  it('returns existing preset silently on duplicate (upsert)', async () => {
    authedSession()
    asMock(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    const result = await saveUserCategoryPresetAction('Arquitectura')

    expect(result).toBeNull()
  })

  it('rejects blank name', async () => {
    authedSession()
    await expect(saveUserCategoryPresetAction('  ')).rejects.toThrow()
  })
})

describe('deleteUserCategoryPresetAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requires authentication', async () => {
    anonSession()
    await expect(deleteUserCategoryPresetAction('p-1')).rejects.toThrow(/auth/i)
  })

  it('deletes the preset owned by the user', async () => {
    authedSession()
    asMock(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })

    await expect(deleteUserCategoryPresetAction('p-1')).resolves.toBeUndefined()
    expect(asMock(db.delete)).toHaveBeenCalledTimes(1)
  })
})
