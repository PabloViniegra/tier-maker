import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import { updateTierListStructureAction } from './actions'
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

function mockNotOwned() {
  asMock(db.select).mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  })
}

type StoredItem = { url: string; label: string }

function setupTransaction(
  template: {
    coverImageUrl: string | null
    sidebarItems: StoredItem[]
  } = { coverImageUrl: null, sidebarItems: [] },
  rows: { items: StoredItem[] }[] = []
) {
  asMock(db.transaction).mockImplementation(async (cb) => {
    const tx = {
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([template]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(rows),
          }),
        }),
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
  bankItems: [
    {
      url: 'https://store.public.blob.vercel-storage.com/bank.png',
      label: 'Naruto',
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
          label: 'Luffy',
        },
      ],
    },
    { id: 'row-2', label: 'A', color: '#0ff', items: [] },
  ],
}

const owned =
  'https://store.public.blob.vercel-storage.com/tier-items/user-1/abc.png'
const ownedSidebar =
  'https://store.public.blob.vercel-storage.com/tier-items/user-1/sidebar.png'
const ownedRow =
  'https://store.public.blob.vercel-storage.com/tier-items/user-1/row.png'
const otherUser =
  'https://store.public.blob.vercel-storage.com/tier-items/user-2/abc.png'

describe('updateTierListStructureAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthenticated when no session', async () => {
    anonSession()
    await expect(
      updateTierListStructureAction('tpl-1', validInput)
    ).rejects.toThrow(/auth/i)
  })

  it('throws Not found when tier list belongs to a different user', async () => {
    authedSession('other-user')
    mockNotOwned()
    await expect(
      updateTierListStructureAction('tpl-1', validInput)
    ).rejects.toThrow(/not found/i)
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
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })

  it('revalidates the detail page and the tier list index', async () => {
    authedSession()
    mockOwned('tpl-1')
    setupTransaction()
    await updateTierListStructureAction('tpl-1', validInput)
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists/tpl-1')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists')
  })

  it('accepts input without description (optional field)', async () => {
    authedSession()
    mockOwned()
    setupTransaction()
    const { description: _description, ...withoutDesc } = validInput // eslint-disable-line @typescript-eslint/no-unused-vars
    await expect(
      updateTierListStructureAction('tpl-1', withoutDesc)
    ).resolves.toEqual({ ok: true })
  })

  it('accepts input without coverImageUrl (optional field)', async () => {
    authedSession()
    mockOwned()
    setupTransaction()
    await expect(
      updateTierListStructureAction('tpl-1', {
        ...validInput,
        coverImageUrl: undefined,
      })
    ).resolves.toEqual({ ok: true })
  })

  it('propagates transaction errors', async () => {
    authedSession()
    mockOwned()
    asMock(db.transaction).mockRejectedValue(new Error('db failure'))
    await expect(
      updateTierListStructureAction('tpl-1', validInput)
    ).rejects.toThrow(/db failure/i)
  })

  it('purges removed owned cover, sidebar, and row URLs after saving', async () => {
    authedSession()
    mockOwned()
    setupTransaction(
      {
        coverImageUrl: owned,
        sidebarItems: [{ url: ownedSidebar, label: 'Sidebar item' }],
      },
      [{ items: [{ url: ownedRow, label: 'Row item' }] }]
    )

    await updateTierListStructureAction('tpl-1', validInput)

    expect(del).toHaveBeenCalledWith([owned, ownedSidebar, ownedRow])
  })

  it('does not purge a URL still present in the new catalogue', async () => {
    authedSession()
    mockOwned()
    setupTransaction({
      coverImageUrl: null,
      sidebarItems: [{ url: owned, label: 'Saved item' }],
    })

    await updateTierListStructureAction('tpl-1', {
      ...validInput,
      bankItems: [{ url: owned, label: 'Saved item' }],
    })

    expect(del).not.toHaveBeenCalled()
  })

  it('does not pass URLs outside the current user ownership boundary to purge', async () => {
    authedSession()
    mockOwned()
    setupTransaction({ coverImageUrl: otherUser, sidebarItems: [] })

    await updateTierListStructureAction('tpl-1', validInput)

    expect(del).not.toHaveBeenCalled()
  })

  it('uses one transaction and keeps existing revalidation paths', async () => {
    authedSession()
    mockOwned()
    setupTransaction()

    await updateTierListStructureAction('tpl-1', validInput)

    expect(db.transaction).toHaveBeenCalledTimes(1)
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists/tpl-1')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tier-lists')
    expect(revalidatePath).toHaveBeenCalledWith('/explore', 'layout')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/explore', 'layout')
  })
})
