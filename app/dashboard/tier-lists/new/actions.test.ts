import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockPut, mockRevalidatePath, mockGetSession, mockDbInsert, mockDbDelete } =
  vi.hoisted(() => ({
    mockPut: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockGetSession: vi.fn(),
    mockDbInsert: vi.fn(),
    mockDbDelete: vi.fn(),
  }))

vi.mock('@vercel/blob', () => ({
  put: mockPut,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/lib/session', () => ({
  getSession: mockGetSession,
}))

vi.mock('@/lib/db', () => {
  const insertReturning = vi.fn()
  mockDbInsert.mockReturnValue({ values: () => ({ returning: insertReturning }) })
  mockDbDelete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) })
  return {
    db: {
      insert: mockDbInsert,
      delete: mockDbDelete,
    },
  }
})

import { uploadImagesAction, createTierListAction } from './actions'
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

function setupDbInsert(result: { id: string }[]) {
  const insertReturning = vi.fn().mockResolvedValue(result)
  mockDbInsert.mockReturnValue({ values: () => ({ returning: insertReturning }) })
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

  it('persists the template and rows and revalidates the dashboard', async () => {
    authedSession()
    const templateId = 'tpl-1'
    setupDbInsert([{ id: templateId }])

    const result = await createTierListAction({
      ...validInput,
      bankItems: ['https://blob/a.png'],
      rows: validInput.rows.map((r, i) =>
        i === 0
          ? { ...r, items: ['https://blob/b.png'] }
          : r
      ),
    })

    expect(result.id).toBe(templateId)
    expect(mockDbInsert).toHaveBeenCalledTimes(2) // template + rows
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('rejects payloads with too many items', async () => {
    authedSession()
    const tooMany = Array.from({ length: 31 }, (_, i) => `https://blob/${i}.png`)
    await expect(
      createTierListAction({ ...validInput, bankItems: tooMany })
    ).rejects.toThrow()
  })
})
