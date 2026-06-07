import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockPut, mockRevalidatePath, mockRevalidateTag, mockGetSession, mockTransaction } =
  vi.hoisted(() => ({
    mockPut: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockRevalidateTag: vi.fn(),
    mockGetSession: vi.fn(),
    mockTransaction: vi.fn(),
  }))

vi.mock('@vercel/blob', () => ({
  put: mockPut,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}))

vi.mock('@/lib/session', () => ({
  getSession: mockGetSession,
}))

vi.mock('@/lib/db', () => ({
  db: {
    transaction: mockTransaction,
  },
}))

import { uploadImagesAction, createTierListAction } from './actions'
import { getCategoryPresets } from '@/lib/queries/category-presets'
import { defaultTierRows } from '@/lib/validators/tier-list'

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type })
}

function authedSession(userId = 'user-1') {
  mockGetSession.mockResolvedValue({ user: { id: userId } })
}

function anonSession() {
  mockGetSession.mockResolvedValue(null)
}

function setupTransaction(templateId = 'tpl-1') {
  mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: templateId }]),
        }),
      }),
    }
    return cb(tx)
  })
}

describe('uploadImagesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires an authenticated session', async () => {
    anonSession()
    const fd = new FormData()
    fd.append('file', makeFile('x.png', 'image/png', 1024))
    await expect(uploadImagesAction(fd)).rejects.toThrow(/auth/i)
  })

  it('throws when no file is provided', async () => {
    authedSession()
    const fd = new FormData()
    await expect(uploadImagesAction(fd)).rejects.toThrow(/no file/i)
  })

  it('rejects unsupported mime types', async () => {
    authedSession()
    const fd = new FormData()
    fd.append('file', makeFile('doc.pdf', 'application/pdf', 1024))
    await expect(uploadImagesAction(fd)).rejects.toThrow(/image/i)
  })

  it('rejects files larger than 5MB', async () => {
    authedSession()
    const fd = new FormData()
    fd.append('file', makeFile('big.png', 'image/png', 5 * 1024 * 1024 + 1))
    await expect(uploadImagesAction(fd)).rejects.toThrow(/5 ?mb/i)
  })

  it('uploads the file and returns its public url', async () => {
    authedSession()
    mockPut.mockResolvedValue({
      url: 'https://blob.vercel-storage.com/items/x.png',
      pathname: 'items/x.png',
    })

    const fd = new FormData()
    fd.append('file', makeFile('x.png', 'image/png', 1024))
    const result = await uploadImagesAction(fd)

    expect(result.url).toBe('https://blob.vercel-storage.com/items/x.png')
    expect(mockPut).toHaveBeenCalledWith(
      expect.stringMatching(/^tier-items\/user-1\/.+\.png$/),
      expect.any(File),
      expect.objectContaining({ access: 'public' })
    )
  })

  it('propagates errors from vercel blob', async () => {
    authedSession()
    mockPut.mockRejectedValue(new Error('blob service down'))
    const fd = new FormData()
    fd.append('file', makeFile('x.png', 'image/png', 1024))
    await expect(uploadImagesAction(fd)).rejects.toThrow(/blob/i)
  })
})

describe('createTierListAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validInput = {
    title: 'Best Movies',
    description: 'My ranking',
    category: 'Cinema',
    rows: defaultTierRows().map((r) => ({ ...r, items: [] })),
    bankItems: [],
  }

  it('requires an authenticated session', async () => {
    anonSession()
    await expect(createTierListAction(validInput)).rejects.toThrow(/auth/i)
  })

  it('rejects payloads that fail validation', async () => {
    authedSession()
    await expect(
      createTierListAction({ ...validInput, title: '' })
    ).rejects.toThrow()
  })

  it('wraps inserts in a transaction and revalidates the dashboard', async () => {
    authedSession()
    setupTransaction('tpl-1')

    const result = await createTierListAction({
      ...validInput,
      bankItems: [{ url: 'https://blob/a.png', label: 'A cake' }],
      rows: validInput.rows.map((r, i) =>
        i === 0 ? { ...r, items: [{ url: 'https://blob/b.png', label: 'B cake' }] } : r
      ),
    })

    expect(result.id).toBe('tpl-1')
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('propagates transaction errors without orphaned data', async () => {
    authedSession()
    mockTransaction.mockRejectedValue(new Error('db failure'))

    await expect(createTierListAction(validInput)).rejects.toThrow(/db failure/i)
  })

  it('rejects payloads with too many items', async () => {
    authedSession()
    const tooMany = Array.from({ length: 31 }, (_, i) => ({
      url: `https://blob/${i}.png`,
      label: `Item ${i}`,
    }))
    await expect(
      createTierListAction({ ...validInput, bankItems: tooMany })
    ).rejects.toThrow()
  })
})

describe('getCategoryPresets', () => {
  it('returns exactly 15 presets', async () => {
    const presets = await getCategoryPresets()
    expect(presets).toHaveLength(15)
  })

  it('returns only non-empty strings', async () => {
    const presets = await getCategoryPresets()
    expect(presets.every((p) => typeof p === 'string' && p.length > 0)).toBe(true)
  })
})
