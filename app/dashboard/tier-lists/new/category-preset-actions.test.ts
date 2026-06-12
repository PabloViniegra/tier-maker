import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockGetSession, mockInsert, mockDelete } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockInsert: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }))

vi.mock('@/lib/db', () => ({
  db: {
    insert: mockInsert,
    delete: mockDelete,
  },
}))

import {
  saveUserCategoryPresetAction,
  deleteUserCategoryPresetAction,
} from './actions'

function authedSession(userId = 'user-1') {
  mockGetSession.mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  mockGetSession.mockResolvedValue(null)
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
    mockInsert.mockReturnValue({
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
    mockInsert.mockReturnValue({
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
    mockDelete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })

    await expect(deleteUserCategoryPresetAction('p-1')).resolves.toBeUndefined()
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })
})
