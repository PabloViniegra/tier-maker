import { describe, it, expect } from 'vitest'
import {
  createTierListSchema,
  defaultTierRows,
  MAX_ITEM_COUNT,
  MAX_ROW_COUNT,
  MIN_ROW_COUNT,
} from './tier-list'

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
    const result = createTierListSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts a payload with items in rows and bank', () => {
    const input = {
      ...validInput,
      bankItems: ['https://blob.vercel-storage.com/a.png'],
      rows: validInput.rows.map((r, i) =>
        i === 0
          ? { ...r, items: ['https://blob.vercel-storage.com/b.png'] }
          : r
      ),
    }
    const result = createTierListSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejects an empty title', () => {
    const result = createTierListSchema.safeParse({ ...validInput, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a title longer than 80 characters', () => {
    const result = createTierListSchema.safeParse({
      ...validInput,
      title: 'x'.repeat(81),
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty category', () => {
    const result = createTierListSchema.safeParse({
      ...validInput,
      category: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a description longer than 500 characters', () => {
    const result = createTierListSchema.safeParse({
      ...validInput,
      description: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('treats missing description as undefined (optional)', () => {
    const { description: _omit, ...rest } = validInput
    void _omit
    const result = createTierListSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })

  it(`rejects fewer than ${MIN_ROW_COUNT} rows`, () => {
    const result = createTierListSchema.safeParse({
      ...validInput,
      rows: validInput.rows.slice(0, MIN_ROW_COUNT - 1),
    })
    expect(result.success).toBe(false)
  })

  it(`rejects more than ${MAX_ROW_COUNT} rows`, () => {
    const tooMany = Array.from({ length: MAX_ROW_COUNT + 1 }, (_, i) => ({
      id: `row-${i}`,
      label: `R${i}`,
      color: 'oklch(0.5 0.2 200)',
      items: [],
    }))
    const result = createTierListSchema.safeParse({
      ...validInput,
      rows: tooMany,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a row with an empty label', () => {
    const rows = validInput.rows.map((r, i) =>
      i === 0 ? { ...r, label: '' } : r
    )
    const result = createTierListSchema.safeParse({ ...validInput, rows })
    expect(result.success).toBe(false)
  })

  it('rejects a row item that is not a URL', () => {
    const rows = validInput.rows.map((r, i) =>
      i === 0 ? { ...r, items: ['not-a-url'] } : r
    )
    const result = createTierListSchema.safeParse({ ...validInput, rows })
    expect(result.success).toBe(false)
  })

  it(`rejects more than ${MAX_ITEM_COUNT} total items (rows + bank)`, () => {
    const fullRows = validInput.rows.map((r) => ({
      ...r,
      items: Array.from(
        { length: Math.ceil(MAX_ITEM_COUNT / validInput.rows.length) + 1 },
        (_, i) => `https://blob.vercel-storage.com/${i}.png`
      ),
    }))
    const result = createTierListSchema.safeParse({
      ...validInput,
      rows: fullRows,
    })
    expect(result.success).toBe(false)
  })
})
