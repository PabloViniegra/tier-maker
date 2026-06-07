import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { getTierFill, setTierFill, deleteTierFill } from '../tier-fill-store'
import type { TierFillDraft } from '../tier-fill-store'

const KEY = 'user-123:tier-abc'
const DRAFT: TierFillDraft = {
  rows: [{ id: 'r1', label: 'S', color: '#ff0000', items: [] }],
  bankItems: [{ id: 'x1', label: 'A', url: 'https://img/a.jpg', status: 'uploaded' }],
}

beforeEach(async () => {
  await deleteTierFill(KEY).catch(() => {})
})

// ── Tracer bullet ────────────────────────────────────────────────────────────

describe('tier-fill-store — round trip', () => {
  it('get returns null for a key that was never set', async () => {
    const result = await getTierFill(KEY)
    expect(result).toBeNull()
  })

  it('set then get returns the stored draft', async () => {
    await setTierFill(KEY, DRAFT)
    const result = await getTierFill(KEY)
    expect(result).toEqual(DRAFT)
  })
})

// ── Delete ───────────────────────────────────────────────────────────────────

describe('tier-fill-store — delete', () => {
  it('delete removes the entry so get returns null', async () => {
    await setTierFill(KEY, DRAFT)
    await deleteTierFill(KEY)
    const result = await getTierFill(KEY)
    expect(result).toBeNull()
  })
})

// ── Overwrite ─────────────────────────────────────────────────────────────────

describe('tier-fill-store — overwrite', () => {
  it('second set overwrites first', async () => {
    await setTierFill(KEY, DRAFT)
    const updated: TierFillDraft = { rows: [], bankItems: [] }
    await setTierFill(KEY, updated)
    const result = await getTierFill(KEY)
    expect(result).toEqual(updated)
  })
})
