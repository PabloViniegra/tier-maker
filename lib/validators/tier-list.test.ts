import { describe, it, expect } from 'vitest'
import {
  buildCatalogue,
  createTierListSchema,
  defaultTierRows,
  imageItemSchema,
  MAX_IMAGE_LABEL_LENGTH,
  MAX_ITEM_COUNT,
  MAX_ROW_COUNT,
  MIN_ROW_COUNT,
  tierColorSchema,
} from './tier-list'

const BLOB = 'https://store.public.blob.vercel-storage.com/a.png'

const item = (url = BLOB, label = 'A cake') => ({
  url,
  label,
})

describe('imageItemSchema', () => {
  it('accepts a valid url + label', () => {
    expect(imageItemSchema.safeParse(item()).success).toBe(true)
  })

  it('rejects a non-url string for url', () => {
    expect(imageItemSchema.safeParse(item('not-a-url')).success).toBe(false)
  })

  it('rejects non-blob https URLs', () => {
    expect(
      imageItemSchema.safeParse(item('https://169.254.169.254/latest')).success
    ).toBe(false)
    expect(
      imageItemSchema.safeParse(item('https://evil.example/x.png')).success
    ).toBe(false)
  })

  it('rejects javascript and http URLs', () => {
    expect(imageItemSchema.safeParse(item('javascript:alert(1)')).success).toBe(
      false
    )
    expect(
      imageItemSchema.safeParse(
        item('http://store.public.blob.vercel-storage.com/a.png')
      ).success
    ).toBe(false)
  })

  it('rejects an empty label', () => {
    expect(imageItemSchema.safeParse(item(undefined, '')).success).toBe(false)
  })

  it(`rejects a label longer than ${MAX_IMAGE_LABEL_LENGTH} characters`, () => {
    expect(
      imageItemSchema.safeParse(
        item(undefined, 'x'.repeat(MAX_IMAGE_LABEL_LENGTH + 1))
      ).success
    ).toBe(false)
  })

  it(`accepts a label of exactly ${MAX_IMAGE_LABEL_LENGTH} characters`, () => {
    expect(
      imageItemSchema.safeParse(
        item(undefined, 'x'.repeat(MAX_IMAGE_LABEL_LENGTH))
      ).success
    ).toBe(true)
  })
})

describe('defaultTierRows', () => {
  it('returns 6 rows in canonical S->F order', () => {
    const rows = defaultTierRows()
    expect(rows).toHaveLength(6)
    expect(rows.map((r) => r.label)).toEqual(['S', 'A', 'B', 'C', 'D', 'F'])
  })

  it('assigns a stable id to each row', () => {
    const rows = defaultTierRows()
    const ids = rows.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('createTierListSchema', () => {
  const validInput = {
    title: 'Best Movies',
    description: 'My personal ranking of movies',
    category: 'Cinema',
    rows: defaultTierRows().map((r) => ({ ...r, items: [] })),
    bankItems: [],
  }

  it('accepts a valid payload with the default rows', () => {
    expect(createTierListSchema.safeParse(validInput).success).toBe(true)
  })

  it('accepts items as {url, label} objects in rows and bank', () => {
    const input = {
      ...validInput,
      bankItems: [
        item(BLOB, 'Strawberry cake'),
      ],
      rows: validInput.rows.map((r, i) =>
        i === 0
          ? {
              ...r,
              items: [
                item(
                  'https://store.public.blob.vercel-storage.com/b.png',
                  'Chocolate tart'
                ),
              ],
            }
          : r
      ),
    }
    expect(createTierListSchema.safeParse(input).success).toBe(true)
  })

  it('rejects a bank item without a label', () => {
    const input = {
      ...validInput,
      bankItems: [{ url: BLOB }],
    }
    expect(createTierListSchema.safeParse(input).success).toBe(false)
  })

  it('rejects a bank item with an empty label', () => {
    const input = {
      ...validInput,
      bankItems: [item(BLOB, '')],
    }
    expect(createTierListSchema.safeParse(input).success).toBe(false)
  })

  it('rejects a row item that is not a valid imageItem', () => {
    const rows = validInput.rows.map((r, i) =>
      i === 0 ? { ...r, items: [{ url: 'not-a-url', label: 'ok' }] } : r
    )
    expect(
      createTierListSchema.safeParse({ ...validInput, rows }).success
    ).toBe(false)
  })

  it('rejects an empty title', () => {
    expect(
      createTierListSchema.safeParse({ ...validInput, title: '' }).success
    ).toBe(false)
  })

  it('rejects a title longer than 80 characters', () => {
    expect(
      createTierListSchema.safeParse({ ...validInput, title: 'x'.repeat(81) })
        .success
    ).toBe(false)
  })

  it('rejects an empty category', () => {
    expect(
      createTierListSchema.safeParse({ ...validInput, category: '' }).success
    ).toBe(false)
  })

  it('rejects a description longer than 500 characters', () => {
    expect(
      createTierListSchema.safeParse({
        ...validInput,
        description: 'x'.repeat(501),
      }).success
    ).toBe(false)
  })

  it('treats missing description as undefined (optional)', () => {
    const { description: _omit, ...rest } = validInput
    void _omit
    expect(createTierListSchema.safeParse(rest).success).toBe(true)
  })

  it(`rejects fewer than ${MIN_ROW_COUNT} rows`, () => {
    expect(
      createTierListSchema.safeParse({
        ...validInput,
        rows: validInput.rows.slice(0, MIN_ROW_COUNT - 1),
      }).success
    ).toBe(false)
  })

  it(`rejects more than ${MAX_ROW_COUNT} rows`, () => {
    const tooMany = Array.from({ length: MAX_ROW_COUNT + 1 }, (_, i) => ({
      id: `row-${i}`,
      label: `R${i}`,
      color: 'oklch(0.5 0.2 200)',
      items: [],
    }))
    expect(
      createTierListSchema.safeParse({ ...validInput, rows: tooMany }).success
    ).toBe(false)
  })

  it('rejects a row with an empty label', () => {
    const rows = validInput.rows.map((r, i) =>
      i === 0 ? { ...r, label: '' } : r
    )
    expect(
      createTierListSchema.safeParse({ ...validInput, rows }).success
    ).toBe(false)
  })

  it(`rejects more than ${MAX_ITEM_COUNT} total items (rows + bank)`, () => {
    const fullRows = validInput.rows.map((r) => ({
      ...r,
      items: Array.from(
        { length: Math.ceil(MAX_ITEM_COUNT / validInput.rows.length) + 1 },
        (_, i) =>
          item(
            `https://store.public.blob.vercel-storage.com/${i}.png`,
            `Item ${i}`
          )
      ),
    }))
    expect(
      createTierListSchema.safeParse({ ...validInput, rows: fullRows }).success
    ).toBe(false)
  })

  it('accepts an optional coverImageUrl', () => {
    const input = {
      ...validInput,
      coverImageUrl: 'https://store.public.blob.vercel-storage.com/cover.png',
    }
    expect(createTierListSchema.safeParse(input).success).toBe(true)
  })

  it('rejects a non-url coverImageUrl', () => {
    const input = { ...validInput, coverImageUrl: 'not-a-url' }
    expect(createTierListSchema.safeParse(input).success).toBe(false)
  })

  it('rejects a non-blob coverImageUrl', () => {
    const input = { ...validInput, coverImageUrl: 'https://evil.example/x.png' }
    expect(createTierListSchema.safeParse(input).success).toBe(false)
  })
})

describe('tierColorSchema', () => {
  it('accepts hex and oklch', () => {
    expect(tierColorSchema.safeParse('#ff0').success).toBe(true)
    expect(tierColorSchema.safeParse('oklch(0.65 0.22 250)').success).toBe(true)
  })

  it('rejects css url() and javascript', () => {
    expect(
      tierColorSchema.safeParse('url(https://evil.example/track)').success
    ).toBe(false)
    expect(tierColorSchema.safeParse('javascript:alert(1)').success).toBe(false)
  })
})

describe('buildCatalogue', () => {
  it('unions bank and row items without duplicate urls', () => {
    const bank = [item(BLOB, 'Bank')]
    const rows = [
      {
        items: [
          item(BLOB, 'Placed same'),
          item('https://store.public.blob.vercel-storage.com/b.png', 'B'),
        ],
      },
    ]
    expect(buildCatalogue(bank, rows)).toEqual([
      item(BLOB, 'Bank'),
      item('https://store.public.blob.vercel-storage.com/b.png', 'B'),
    ])
  })

  it('keeps row items when the bank is empty', () => {
    const rows = [{ items: [item(BLOB, 'Placed')] }]
    expect(buildCatalogue([], rows)).toEqual([item(BLOB, 'Placed')])
  })
})
