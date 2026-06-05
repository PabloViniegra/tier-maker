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

import { updateTierListAction } from './actions'

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

const validPayload = {
  bankItems: [{ url: 'https://blob/bank.png', label: 'Bank item' }],
  rows: [
    { id: 'row-1', label: 'S', color: '#ff0', items: [{ url: 'https://blob/a.png', label: 'A item' }] },
    { id: 'row-2', label: 'A', color: '#0ff', items: [] },
  ],
}

describe('updateTierListAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthenticated when no session', async () => {
    anonSession()
    await expect(updateTierListAction('tpl-1', validPayload)).rejects.toThrow(/auth/i)
  })

  it('throws when tier list belongs to a different user', async () => {
    authedSession('user-other')
    mockNotOwned()
    await expect(updateTierListAction('tpl-1', validPayload)).rejects.toThrow(/not found/i)
  })

  it('returns { ok: true } on valid owned update', async () => {
    authedSession()
    mockOwned()
    setupTransaction()

    const result = await updateTierListAction('tpl-1', validPayload)

    expect(result).toEqual({ ok: true })
  })

  it('runs inside a transaction', async () => {
    authedSession()
    mockOwned()
    setupTransaction()

    await updateTierListAction('tpl-1', validPayload)

    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  it('revalidates the detail page and index after save', async () => {
    authedSession()
    mockOwned('tpl-1')
    setupTransaction()

    await updateTierListAction('tpl-1', validPayload)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists/tpl-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists')
  })

  it('propagates transaction errors', async () => {
    authedSession()
    mockOwned()
    mockTransaction.mockRejectedValue(new Error('db failure'))

    await expect(updateTierListAction('tpl-1', validPayload)).rejects.toThrow(/db failure/i)
  })
})
