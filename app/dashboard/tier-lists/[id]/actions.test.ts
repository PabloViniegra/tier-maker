import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { updateTierListAction } from './actions'
import { asMock } from '@/test/as-mock'

function authedSession(userId = 'user-1') {
  asMock(getSession).mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  asMock(getSession).mockResolvedValue(null)
}

function mockOwned(templateId = 'tpl-1') {
  asMock(db.select).mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: templateId }]),
    }),
  })
}

function setupTransaction(ownedId = 'tpl-1') {
  asMock(db.transaction).mockImplementation(async (cb) => {
    const tx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: ownedId }]),
          }),
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

function setupTransactionNotOwned() {
  asMock(db.transaction).mockImplementation(async (cb) => {
    const tx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
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
  bankItems: [
    {
      url: 'https://store.public.blob.vercel-storage.com/bank.png',
      label: 'Bank item',
    },
  ],
  rows: [
    {
      id: 'row-1',
      label: 'S',
      color: '#ff0',
      items: [
        {
          url: 'https://store.public.blob.vercel-storage.com/a.png',
          label: 'A item',
        },
      ],
    },
    { id: 'row-2', label: 'A', color: '#0ff', items: [] },
  ],
}

describe('updateTierListAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthenticated when no session', async () => {
    anonSession()
    await expect(updateTierListAction('tpl-1', validPayload)).rejects.toThrow(
      /auth/i
    )
  })

  it('throws when tier list belongs to a different user', async () => {
    authedSession('user-other')
    setupTransactionNotOwned()
    await expect(updateTierListAction('tpl-1', validPayload)).rejects.toThrow(
      /not found/i
    )
  })

  it('returns { ok: true } on valid owned update', async () => {
    authedSession()
    setupTransaction()

    const result = await updateTierListAction('tpl-1', validPayload)

    expect(result).toEqual({ ok: true })
  })

  it('runs inside a transaction', async () => {
    authedSession()
    setupTransaction()

    await updateTierListAction('tpl-1', validPayload)

    expect(db.transaction).toHaveBeenCalledTimes(1)
  })

  it('revalidates the detail page after save', async () => {
    authedSession()
    setupTransaction('tpl-1')

    await updateTierListAction('tpl-1', validPayload)

    expect(revalidatePath).toHaveBeenCalledWith(
      '/dashboard/tier-lists/tpl-1'
    )
  })

  it('propagates transaction errors', async () => {
    authedSession()
    mockOwned()
    asMock(db.transaction).mockRejectedValue(new Error('db failure'))

    await expect(updateTierListAction('tpl-1', validPayload)).rejects.toThrow(
      /db failure/i
    )
  })
})
