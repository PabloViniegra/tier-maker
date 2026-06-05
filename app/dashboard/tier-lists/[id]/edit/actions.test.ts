import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockGetSession, mockRevalidatePath, mockSelect, mockTransaction } =
  vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockSelect: vi.fn(),
    mockTransaction: vi.fn(),
  }))

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }))
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))
vi.mock('@/lib/db', () => ({
  db: {
    select: mockSelect,
    transaction: mockTransaction,
  },
}))

import { updateTierListStructureAction } from './actions'

function authedSession(userId = 'user-1') {
  mockGetSession.mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  mockGetSession.mockResolvedValue(null)
}

function mockOwned(templateId = 'tpl-1') {
  mockSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: templateId }]),
    }),
  })
}

function mockNotOwned() {
  mockSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  })
}

function setupTransaction() {
  mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    }
    return cb(tx)
  })
}

const validInput = {
  title: 'Anime Rankings',
  description: 'My picks',
  category: 'Anime',
  bankItems: [{ url: 'https://blob/bank.png', label: 'Naruto' }],
  rows: [
    { id: 'row-1', label: 'S', color: '#ff0', items: [{ url: 'https://blob/a.png', label: 'Luffy' }] },
    { id: 'row-2', label: 'A', color: '#0ff', items: [] },
  ],
}

describe('updateTierListStructureAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthenticated when no session', async () => {
    anonSession()
    await expect(updateTierListStructureAction('tpl-1', validInput)).rejects.toThrow(/auth/i)
  })

  it('throws Not found when tier list belongs to a different user', async () => {
    authedSession('other-user')
    mockNotOwned()
    await expect(updateTierListStructureAction('tpl-1', validInput)).rejects.toThrow(/not found/i)
  })

  it('returns { ok: true } on valid owned update', async () => {
    authedSession()
    mockOwned()
    setupTransaction()
    const result = await updateTierListStructureAction('tpl-1', validInput)
    expect(result).toEqual({ ok: true })
  })

  it('runs all DB mutations inside a transaction', async () => {
    authedSession()
    mockOwned()
    setupTransaction()
    await updateTierListStructureAction('tpl-1', validInput)
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  it('revalidates the detail page and the tier list index', async () => {
    authedSession()
    mockOwned('tpl-1')
    setupTransaction()
    await updateTierListStructureAction('tpl-1', validInput)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists/tpl-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists')
  })

  it('accepts input without description (optional field)', async () => {
    authedSession()
    mockOwned()
    setupTransaction()
    const { description: _, ...withoutDesc } = validInput
    await expect(updateTierListStructureAction('tpl-1', withoutDesc)).resolves.toEqual({ ok: true })
  })

  it('accepts input without coverImageUrl (optional field)', async () => {
    authedSession()
    mockOwned()
    setupTransaction()
    await expect(
      updateTierListStructureAction('tpl-1', { ...validInput, coverImageUrl: undefined })
    ).resolves.toEqual({ ok: true })
  })

  it('propagates transaction errors', async () => {
    authedSession()
    mockOwned()
    mockTransaction.mockRejectedValue(new Error('db failure'))
    await expect(updateTierListStructureAction('tpl-1', validInput)).rejects.toThrow(/db failure/i)
  })
})
