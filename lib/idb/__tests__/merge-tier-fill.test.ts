import { describe, it, expect } from 'vitest'
import { mergeTierFill } from '../merge-tier-fill'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'
import type { TierFillDraft } from '../tier-fill-store'

const baseSeed: TierListDetailSeed = {
  title: 'My Tier',
  description: null,
  category: 'games',
  coverImageUrl: null,
  sidebarItems: [
    { url: 'https://img/a.jpg', label: 'A' },
    { url: 'https://img/b.jpg', label: 'B' },
  ],
  rows: [
    { id: 'r1', label: 'S', color: '#ff0000', order: 0, items: [] },
    { id: 'r2', label: 'A', color: '#00ff00', order: 1, items: [] },
  ],
}

// ── Tracer bullet ────────────────────────────────────────────────────────────

describe('mergeTierFill — no draft', () => {
  it('returns server rows (empty) and full bank when no draft provided', () => {
    const result = mergeTierFill(baseSeed, null)

    expect(result.rows).toHaveLength(2)
    expect(result.rows[0].id).toBe('r1')
    expect(result.rows[0].items).toHaveLength(0)
    expect(result.rows[1].id).toBe('r2')
    expect(result.bankItems).toHaveLength(2)
    expect(result.bankItems.map((i) => i.url)).toEqual([
      'https://img/a.jpg',
      'https://img/b.jpg',
    ])
  })
})

// ── IDB draft restores placed items ─────────────────────────────────────────

describe('mergeTierFill — draft with placed items', () => {
  it('restores items to matching rows from draft', () => {
    const draft: TierFillDraft = {
      rows: [
        {
          id: 'r1',
          label: 'S',
          color: '#ff0000',
          items: [{ id: 'x1', label: 'A', url: 'https://img/a.jpg', status: 'uploaded' }],
        },
        { id: 'r2', label: 'A', color: '#00ff00', items: [] },
      ],
      bankItems: [{ id: 'x2', label: 'B', url: 'https://img/b.jpg', status: 'uploaded' }],
    }

    const result = mergeTierFill(baseSeed, draft)

    expect(result.rows[0].items).toHaveLength(1)
    expect(result.rows[0].items[0].url).toBe('https://img/a.jpg')
    expect(result.rows[1].items).toHaveLength(0)
    // B is already in bank draft — bank should only contain it
    expect(result.bankItems).toHaveLength(1)
    expect(result.bankItems[0].url).toBe('https://img/b.jpg')
  })
})

// ── New server row appears empty ─────────────────────────────────────────────

describe('mergeTierFill — server adds new row', () => {
  it('new server row appears empty in result', () => {
    const seedWithNewRow: TierListDetailSeed = {
      ...baseSeed,
      rows: [
        ...baseSeed.rows,
        { id: 'r3', label: 'B', color: '#0000ff', order: 2, items: [] },
      ],
    }
    const draft: TierFillDraft = {
      rows: [
        {
          id: 'r1',
          items: [{ id: 'x1', label: 'A', url: 'https://img/a.jpg', status: 'uploaded' }],
          label: 'S',
          color: '#ff0000',
        },
        { id: 'r2', items: [], label: 'A', color: '#00ff00' },
      ],
      bankItems: [],
    }

    const result = mergeTierFill(seedWithNewRow, draft)

    expect(result.rows).toHaveLength(3)
    expect(result.rows[2].id).toBe('r3')
    expect(result.rows[2].items).toHaveLength(0)
  })
})

// ── Removed row — placed items silently dropped ──────────────────────────────

describe('mergeTierFill — server removes a row', () => {
  it('items from removed row are silently dropped, not rescued to bank', () => {
    const seedWithoutR2: TierListDetailSeed = {
      ...baseSeed,
      rows: [{ id: 'r1', label: 'S', color: '#ff0000', order: 0, items: [] }],
    }
    const draft: TierFillDraft = {
      rows: [
        {
          id: 'r1',
          items: [],
          label: 'S',
          color: '#ff0000',
        },
        {
          id: 'r2',
          items: [{ id: 'x2', label: 'B', url: 'https://img/b.jpg', status: 'uploaded' }],
          label: 'A',
          color: '#00ff00',
        },
      ],
      bankItems: [],
    }

    const result = mergeTierFill(seedWithoutR2, draft)

    expect(result.rows).toHaveLength(1)
    const allItems = result.rows.flatMap((r) => r.items)
    expect(allItems.every((i) => i.url !== 'https://img/b.jpg')).toBe(true)
  })
})

// ── Server adds new bank item ─────────────────────────────────────────────────

describe('mergeTierFill — server adds new bank item', () => {
  it('new server bank item appears in result bank', () => {
    const seedWithExtra: TierListDetailSeed = {
      ...baseSeed,
      sidebarItems: [
        ...baseSeed.sidebarItems,
        { url: 'https://img/c.jpg', label: 'C' },
      ],
    }
    const draft: TierFillDraft = {
      rows: [{ id: 'r1', items: [], label: 'S', color: '#ff0000' }, { id: 'r2', items: [], label: 'A', color: '#00ff00' }],
      bankItems: [{ id: 'x1', label: 'A', url: 'https://img/a.jpg', status: 'uploaded' }],
    }

    const result = mergeTierFill(seedWithExtra, draft)

    const bankUrls = result.bankItems.map((i) => i.url)
    expect(bankUrls).toContain('https://img/c.jpg')
  })
})

// ── Server removes bank item that was in IDB bank ────────────────────────────

describe('mergeTierFill — server removes bank item', () => {
  it('item removed from server seed is dropped from result bank', () => {
    const seedWithoutB: TierListDetailSeed = {
      ...baseSeed,
      sidebarItems: [{ url: 'https://img/a.jpg', label: 'A' }],
    }
    const draft: TierFillDraft = {
      rows: [{ id: 'r1', items: [], label: 'S', color: '#ff0000' }, { id: 'r2', items: [], label: 'A', color: '#00ff00' }],
      bankItems: [
        { id: 'x1', label: 'A', url: 'https://img/a.jpg', status: 'uploaded' },
        { id: 'x2', label: 'B', url: 'https://img/b.jpg', status: 'uploaded' },
      ],
    }

    const result = mergeTierFill(seedWithoutB, draft)

    expect(result.bankItems.every((i) => i.url !== 'https://img/b.jpg')).toBe(true)
  })
})
