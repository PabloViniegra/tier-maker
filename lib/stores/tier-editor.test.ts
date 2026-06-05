import { describe, it, expect, beforeEach } from 'vitest'
import { useTierEditor, hasPendingUploads, buildSavePayload, type TierListDetailSeed } from './tier-editor'

function reset() {
  useTierEditor.getState().reset()
}

function snapshot() {
  const s = useTierEditor.getState()
  return {
    metadata: s.metadata,
    rows: s.rows.map((r) => ({ id: r.id, label: r.label, color: r.color, items: [...r.items] })),
    bankItems: [...s.bankItems],
  }
}

describe('useTierEditor — initial state', () => {
  beforeEach(() => reset())

  it('starts with empty metadata', () => {
    expect(snapshot().metadata).toMatchObject({
      title: '',
      description: '',
      category: '',
    })
  })

  it('starts with 6 default rows', () => {
    expect(snapshot().rows).toHaveLength(6)
    expect(snapshot().rows.map((r) => r.label)).toEqual([
      'S',
      'A',
      'B',
      'C',
      'D',
      'F',
    ])
  })

  it('starts with an empty bank', () => {
    expect(snapshot().bankItems).toEqual([])
  })
})

describe('useTierEditor — setMetadata', () => {
  beforeEach(() => reset())

  it('updates title, description, and category', () => {
    useTierEditor.getState().setMetadata({
      title: 'Best Movies',
      description: 'My picks',
      category: 'Cinema',
    })
    expect(snapshot().metadata).toMatchObject({
      title: 'Best Movies',
      description: 'My picks',
      category: 'Cinema',
    })
  })

  it('merges partial updates', () => {
    useTierEditor.getState().setMetadata({ title: 'X' })
    useTierEditor.getState().setMetadata({ category: 'Anime' })
    expect(snapshot().metadata).toMatchObject({
      title: 'X',
      description: '',
      category: 'Anime',
    })
  })

  it('stores coverImageUrl in metadata', () => {
    useTierEditor.getState().setMetadata({ coverImageUrl: 'https://blob/cover.png' })
    expect(snapshot().metadata.coverImageUrl).toBe('https://blob/cover.png')
  })
})

describe('useTierEditor — bank item lifecycle', () => {
  beforeEach(() => reset())

  it('adds an uploading placeholder with label and returns its id', () => {
    const id = useTierEditor.getState().addUploadingItem('Chocolate cake')
    const bank = snapshot().bankItems
    expect(bank).toHaveLength(1)
    expect(bank[0]).toMatchObject({ id, label: 'Chocolate cake', status: 'uploading' })
  })

  it('marks an item as uploaded and stores its url', () => {
    const id = useTierEditor.getState().addUploadingItem('Cheese tart')
    useTierEditor.getState().markItemUploaded(id, 'https://blob/x.png')
    const bank = snapshot().bankItems
    expect(bank[0]).toMatchObject({
      id,
      status: 'uploaded',
      url: 'https://blob/x.png',
      label: 'Cheese tart',
    })
  })

  it('marks an item as errored', () => {
    const id = useTierEditor.getState().addUploadingItem('Tiramisu')
    useTierEditor.getState().markItemError(id)
    expect(snapshot().bankItems[0]).toMatchObject({ id, status: 'error' })
  })

  it('removes a bank item by id', () => {
    const a = useTierEditor.getState().addUploadingItem('Apple pie')
    useTierEditor.getState().addUploadingItem('Banana bread')
    useTierEditor.getState().removeItem({ source: 'bank', id: a })
    const labels = snapshot().bankItems.map((i) => i.label)
    expect(labels).toEqual(['Banana bread'])
  })
})

describe('useTierEditor — move / reorder', () => {
  beforeEach(() => reset())

  function seed() {
    const a = useTierEditor.getState().addUploadingItem('Item A')
    const b = useTierEditor.getState().addUploadingItem('Item B')
    useTierEditor.getState().markItemUploaded(a, 'https://blob/a.png')
    useTierEditor.getState().markItemUploaded(b, 'https://blob/b.png')
    return { a, b }
  }

  it('moves an item from the bank into a row', () => {
    const { a } = seed()
    const rowId = snapshot().rows[0].id
    useTierEditor
      .getState()
      .moveItem({ source: 'bank', sourceIndex: 0, target: 'row', targetId: rowId, targetIndex: 0 })
    const s = snapshot()
    expect(s.bankItems).toHaveLength(1)
    expect(s.rows[0].items[0]).toMatchObject({
      id: a,
      url: 'https://blob/a.png',
    })
  })

  it('moves an item from one row to another row', () => {
    const { a, b } = seed()
    const rowA = snapshot().rows[0].id
    const rowB = snapshot().rows[1].id
    useTierEditor.getState().moveItem({ source: 'bank', sourceIndex: 0, target: 'row', targetId: rowA, targetIndex: 0 })
    useTierEditor.getState().moveItem({ source: 'bank', sourceIndex: 0, target: 'row', targetId: rowB, targetIndex: 0 })
    useTierEditor
      .getState()
      .moveItem({ source: 'row', sourceId: rowA, sourceIndex: 0, target: 'row', targetId: rowA, targetIndex: 0 })
    useTierEditor
      .getState()
      .moveItem({ source: 'row', sourceId: rowA, sourceIndex: 0, target: 'row', targetId: rowB, targetIndex: 1 })

    const s = snapshot()
    const all = s.rows.flatMap((r) => r.items.map((i) => i.id))
    expect(all).toContain(a)
    expect(all).toContain(b)
  })

  it('reorders an item within the same row', () => {
    seed()
    const rowId = snapshot().rows[0].id
    useTierEditor
      .getState()
      .moveItem({ source: 'bank', sourceIndex: 0, target: 'row', targetId: rowId, targetIndex: 0 })
    useTierEditor
      .getState()
      .moveItem({ source: 'bank', sourceIndex: 0, target: 'row', targetId: rowId, targetIndex: 1 })
    useTierEditor
      .getState()
      .moveItem({ source: 'row', sourceId: rowId, sourceIndex: 0, target: 'row', targetId: rowId, targetIndex: 1 })

    const s = snapshot()
    expect(s.rows[0].items.map((i) => i.url)).toEqual([
      'https://blob/b.png',
      'https://blob/a.png',
    ])
  })

  it('removes an item from a row', () => {
    seed()
    const rowId = snapshot().rows[0].id
    useTierEditor
      .getState()
      .moveItem({ source: 'bank', sourceIndex: 0, target: 'row', targetId: rowId, targetIndex: 0 })
    const id = snapshot().rows[0].items[0].id
    useTierEditor.getState().removeItem({ source: 'row', id, rowId })
    expect(snapshot().rows[0].items).toEqual([])
  })
})

describe('useTierEditor — updateRow', () => {
  beforeEach(() => reset())

  it('patches the label of an existing row', () => {
    const rowId = snapshot().rows[0].id
    useTierEditor.getState().updateRow(rowId, { label: 'Z' })
    expect(snapshot().rows[0].label).toBe('Z')
  })

  it('patches the color of an existing row', () => {
    const rowId = snapshot().rows[0].id
    useTierEditor.getState().updateRow(rowId, { color: '#ff0000' })
    expect(snapshot().rows[0]).toMatchObject({ color: '#ff0000' })
  })

  it('does not affect other rows', () => {
    const rowId = snapshot().rows[0].id
    useTierEditor.getState().updateRow(rowId, { label: 'Z' })
    const labels = snapshot().rows.map((r) => r.label)
    expect(labels.slice(1)).toEqual(['A', 'B', 'C', 'D', 'F'])
  })
})

describe('useTierEditor — addRow', () => {
  beforeEach(() => reset())

  it('appends a row with default label "?" and color "#6b7280"', () => {
    useTierEditor.getState().addRow()
    const rows = snapshot().rows
    expect(rows).toHaveLength(7)
    expect(rows[6]).toMatchObject({ label: '?', color: '#6b7280' })
  })

  it('does nothing when rows.length is already 10', () => {
    for (let i = 0; i < 4; i++) useTierEditor.getState().addRow()
    expect(snapshot().rows).toHaveLength(10)
    useTierEditor.getState().addRow()
    expect(snapshot().rows).toHaveLength(10)
  })
})

describe('useTierEditor — removeRow', () => {
  beforeEach(() => reset())

  it('removes the target row', () => {
    const rowId = snapshot().rows[0].id
    useTierEditor.getState().removeRow(rowId)
    const ids = snapshot().rows.map((r) => r.id)
    expect(ids).not.toContain(rowId)
    expect(snapshot().rows).toHaveLength(5)
  })

  it('moves items from the removed row back to bankItems', () => {
    const rowId = snapshot().rows[0].id
    const itemId = useTierEditor.getState().addUploadingItem('Croissant')
    useTierEditor.getState().markItemUploaded(itemId, 'https://blob/a.png')
    useTierEditor.getState().moveItem({
      source: 'bank', sourceIndex: 0,
      target: 'row', targetId: rowId, targetIndex: 0,
    })
    expect(snapshot().rows[0].items).toHaveLength(1)
    useTierEditor.getState().removeRow(rowId)
    expect(snapshot().bankItems).toHaveLength(1)
    expect(snapshot().bankItems[0]).toMatchObject({ url: 'https://blob/a.png' })
  })

  it('does nothing when only one row remains', () => {
    const s = useTierEditor.getState()
    for (let i = 0; i < 5; i++) {
      const id = snapshot().rows[0].id
      s.removeRow(id)
    }
    expect(snapshot().rows).toHaveLength(1)
    const lastId = snapshot().rows[0].id
    s.removeRow(lastId)
    expect(snapshot().rows).toHaveLength(1)
  })
})

describe('useTierEditor — reset', () => {
  it('returns to the initial state', () => {
    useTierEditor.getState().setMetadata({ title: 'X' })
    useTierEditor.getState().addUploadingItem('Some item')
    useTierEditor.getState().reset()
    const s = snapshot()
    expect(s.metadata.title).toBe('')
    expect(s.bankItems).toEqual([])
    expect(s.rows).toHaveLength(6)
  })
})

describe('useTierEditor — selectors', () => {
  beforeEach(() => reset())

  it('hasPendingUploads returns true while any item is uploading', () => {
    const id = useTierEditor.getState().addUploadingItem('Eclair')
    expect(hasPendingUploads(useTierEditor.getState())).toBe(true)
    useTierEditor.getState().markItemUploaded(id, 'https://blob/a.png')
    expect(hasPendingUploads(useTierEditor.getState())).toBe(false)
  })

  it('buildSavePayload emits {url, label} objects for items, drops non-uploaded', () => {
    useTierEditor.getState().setMetadata({
      title: '  Best Movies  ',
      description: '  My picks  ',
      category: '  Cinema  ',
    })
    const a = useTierEditor.getState().addUploadingItem('Lemon tart')
    const b = useTierEditor.getState().addUploadingItem('Mousse cake')
    useTierEditor.getState().markItemUploaded(a, 'https://blob/a.png')
    useTierEditor.getState().markItemError(b)
    const rowId = useTierEditor.getState().rows[0].id
    useTierEditor
      .getState()
      .moveItem({ source: 'bank', sourceIndex: 0, target: 'row', targetId: rowId, targetIndex: 0 })

    const payload = buildSavePayload(useTierEditor.getState())

    expect(payload.title).toBe('Best Movies')
    expect(payload.description).toBe('My picks')
    expect(payload.category).toBe('Cinema')
    expect(payload.bankItems).toEqual([])
    expect(payload.rows[0].items).toEqual([{ url: 'https://blob/a.png', label: 'Lemon tart' }])
  })

  it('buildSavePayload includes coverImageUrl when set', () => {
    useTierEditor.getState().setMetadata({
      title: 'T', category: 'C', coverImageUrl: 'https://blob/cover.png',
    })
    const payload = buildSavePayload(useTierEditor.getState())
    expect(payload.coverImageUrl).toBe('https://blob/cover.png')
  })
})

describe('useTierEditor — initFromDb', () => {
  beforeEach(() => reset())

  const seed: TierListDetailSeed = {
    title: 'Anime Tier List',
    description: 'My picks',
    category: 'anime',
    sidebarItems: [
      { url: 'https://blob/bank1.png', label: 'Naruto' },
      { url: 'https://blob/bank2.png', label: 'Goku' },
    ],
    rows: [
      { id: 'row-s', label: 'S', color: '#ff0', order: 0, items: [{ url: 'https://blob/placed.png', label: 'Luffy' }] },
      { id: 'row-a', label: 'A', color: '#0ff', order: 1, items: [] },
    ],
  }

  it('seeds metadata from the DB payload', () => {
    useTierEditor.getState().initFromDb(seed)
    expect(snapshot().metadata).toMatchObject({
      title: 'Anime Tier List',
      description: 'My picks',
      category: 'anime',
    })
  })

  it('seeds rows with correct labels, colors, and placed items with labels', () => {
    useTierEditor.getState().initFromDb(seed)
    const rows = snapshot().rows
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ id: 'row-s', label: 'S', color: '#ff0' })
    expect(rows[0].items[0]).toMatchObject({ url: 'https://blob/placed.png', label: 'Luffy', status: 'uploaded' })
  })

  it('seeds bankItems from sidebarItems preserving labels', () => {
    useTierEditor.getState().initFromDb(seed)
    const bank = snapshot().bankItems
    expect(bank).toHaveLength(2)
    expect(bank[0]).toMatchObject({ url: 'https://blob/bank1.png', label: 'Naruto', status: 'uploaded' })
    expect(bank[1]).toMatchObject({ url: 'https://blob/bank2.png', label: 'Goku', status: 'uploaded' })
  })

  it('seeds coverImageUrl from DB payload', () => {
    useTierEditor.getState().initFromDb({ ...seed, coverImageUrl: 'https://blob/cover.png' })
    expect(snapshot().metadata.coverImageUrl).toBe('https://blob/cover.png')
  })

  it('calling initFromDb twice replaces state completely (idempotent seed)', () => {
    useTierEditor.getState().initFromDb(seed)
    useTierEditor.getState().initFromDb({ ...seed, title: 'Updated', sidebarItems: [] })
    const s = snapshot()
    expect(s.metadata.title).toBe('Updated')
    expect(s.bankItems).toHaveLength(0)
  })

  it('replaces prior state from /new so no leftover items remain', () => {
    useTierEditor.getState().addUploadingItem('stale item')
    useTierEditor.getState().setMetadata({ title: 'Old' })
    useTierEditor.getState().initFromDb(seed)
    const s = snapshot()
    expect(s.metadata.title).toBe('Anime Tier List')
    expect(s.bankItems).toHaveLength(2)
  })
})

describe('useTierEditor — removeItemEverywhere', () => {
  beforeEach(() => reset())

  it('removes an item from the bank when it only exists in the bank', () => {
    const id = useTierEditor.getState().addUploadingItem('Solo bank item')
    useTierEditor.getState().markItemUploaded(id, 'https://blob/a.png')
    useTierEditor.getState().removeItemEverywhere(id)
    expect(snapshot().bankItems).toHaveLength(0)
  })

  it('removes an item from the bank AND from every row it was placed in', () => {
    const id = useTierEditor.getState().addUploadingItem('Placed item')
    useTierEditor.getState().markItemUploaded(id, 'https://blob/b.png')
    const rowId = snapshot().rows[0].id
    useTierEditor.getState().moveItem({
      source: 'bank', sourceIndex: 0,
      target: 'row', targetId: rowId, targetIndex: 0,
    })
    expect(snapshot().rows[0].items).toHaveLength(1)
    useTierEditor.getState().removeItemEverywhere(id)
    expect(snapshot().bankItems).toHaveLength(0)
    expect(snapshot().rows[0].items).toHaveLength(0)
  })

  it('does not affect other items in the bank or rows', () => {
    const keep = useTierEditor.getState().addUploadingItem('Keep me')
    useTierEditor.getState().markItemUploaded(keep, 'https://blob/keep.png')
    const remove = useTierEditor.getState().addUploadingItem('Remove me')
    useTierEditor.getState().markItemUploaded(remove, 'https://blob/remove.png')
    useTierEditor.getState().removeItemEverywhere(remove)
    const bank = snapshot().bankItems
    expect(bank).toHaveLength(1)
    expect(bank[0].id).toBe(keep)
  })
})
