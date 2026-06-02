import { describe, it, expect, beforeEach } from 'vitest'
import { useTierEditor, hasPendingUploads, buildSavePayload } from './tier-editor'

function reset() {
  useTierEditor.getState().reset()
}

function snapshot() {
  const s = useTierEditor.getState()
  return {
    metadata: s.metadata,
    rows: s.rows.map((r) => ({ id: r.id, label: r.label, items: [...r.items] })),
    bankItems: [...s.bankItems],
  }
}

describe('useTierEditor — initial state', () => {
  beforeEach(() => reset())

  it('starts with empty metadata', () => {
    expect(snapshot().metadata).toEqual({
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
    expect(snapshot().metadata).toEqual({
      title: 'Best Movies',
      description: 'My picks',
      category: 'Cinema',
    })
  })

  it('merges partial updates', () => {
    useTierEditor.getState().setMetadata({ title: 'X' })
    useTierEditor.getState().setMetadata({ category: 'Anime' })
    expect(snapshot().metadata).toEqual({
      title: 'X',
      description: '',
      category: 'Anime',
    })
  })
})

describe('useTierEditor — bank item lifecycle', () => {
  beforeEach(() => reset())

  it('adds an uploading placeholder and returns its id', () => {
    const id = useTierEditor.getState().addUploadingItem('photo.png')
    const bank = snapshot().bankItems
    expect(bank).toHaveLength(1)
    expect(bank[0]).toMatchObject({ id, name: 'photo.png', status: 'uploading' })
  })

  it('marks an item as uploaded and stores its url', () => {
    const id = useTierEditor.getState().addUploadingItem('photo.png')
    useTierEditor.getState().markItemUploaded(id, 'https://blob/x.png')
    const bank = snapshot().bankItems
    expect(bank[0]).toMatchObject({
      id,
      status: 'uploaded',
      url: 'https://blob/x.png',
    })
  })

  it('marks an item as errored', () => {
    const id = useTierEditor.getState().addUploadingItem('photo.png')
    useTierEditor.getState().markItemError(id)
    const bank = snapshot().bankItems
    expect(bank[0]).toMatchObject({ id, status: 'error' })
  })

  it('removes a bank item by id', () => {
    const a = useTierEditor.getState().addUploadingItem('a.png')
    useTierEditor.getState().addUploadingItem('b.png')
    useTierEditor.getState().removeItem({ source: 'bank', id: a })
    const names = snapshot().bankItems.map((i) => i.name)
    expect(names).toEqual(['b.png'])
  })
})

describe('useTierEditor — move / reorder', () => {
  beforeEach(() => reset())

  function seed() {
    const a = useTierEditor.getState().addUploadingItem('a.png')
    const b = useTierEditor.getState().addUploadingItem('b.png')
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

describe('useTierEditor — reset', () => {
  it('returns to the initial state', () => {
    useTierEditor.getState().setMetadata({ title: 'X' })
    useTierEditor.getState().addUploadingItem('a.png')
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
    const id = useTierEditor.getState().addUploadingItem('a.png')
    expect(hasPendingUploads(useTierEditor.getState())).toBe(true)
    useTierEditor.getState().markItemUploaded(id, 'https://blob/a.png')
    expect(hasPendingUploads(useTierEditor.getState())).toBe(false)
  })

  it('buildSavePayload trims strings, drops non-uploaded items, returns URL strings', () => {
    useTierEditor.getState().setMetadata({
      title: '  Best Movies  ',
      description: '  My picks  ',
      category: '  Cinema  ',
    })
    const a = useTierEditor.getState().addUploadingItem('a.png')
    const b = useTierEditor.getState().addUploadingItem('b.png')
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
    expect(payload.rows[0].items).toEqual(['https://blob/a.png'])
  })
})
