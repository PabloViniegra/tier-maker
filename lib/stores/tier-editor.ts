'use client'

import { create } from 'zustand'
import { defaultTierRows } from '@/lib/validators/tier-list'

export type TierItemStatus = 'uploading' | 'uploaded' | 'error'

export type TierItem = {
  id: string
  name?: string
  url?: string
  status: TierItemStatus
}

export type EditorTierRow = {
  id: string
  label: string
  color: string
  items: TierItem[]
}

export type EditorMetadata = {
  title: string
  description: string
  category: string
}

export type TierListDetailSeed = {
  title: string
  description?: string | null
  category: string
  sidebarItems: string[]
  rows: {
    id: string
    label: string
    color: string
    order: number
    items: string[]
  }[]
}

type Source = 'bank' | 'row'
type Target = 'bank' | 'row'

export type MoveItem = {
  source: Source
  sourceId?: string
  sourceIndex: number
  target: Target
  targetId?: string
  targetIndex: number
}

type RemoveItem =
  | { source: 'bank'; id: string }
  | { source: 'row'; id: string; rowId: string }

type State = {
  metadata: EditorMetadata
  rows: EditorTierRow[]
  bankItems: TierItem[]
}

type Actions = {
  setMetadata: (patch: Partial<EditorMetadata>) => void
  addUploadingItem: (name?: string) => string
  markItemUploaded: (id: string, url: string) => void
  markItemError: (id: string) => void
  removeItem: (input: RemoveItem) => void
  moveItem: (input: MoveItem) => void
  updateRow: (id: string, patch: Partial<Pick<EditorTierRow, 'label' | 'color'>>) => void
  addRow: () => void
  removeRow: (id: string) => void
  reset: () => void
  initFromDb: (data: TierListDetailSeed) => void
}

const initialState: State = (() => {
  const rows = defaultTierRows().map<EditorTierRow>((r) => ({
    id: r.id,
    label: r.label,
    color: r.color,
    items: [],
  }))
  return {
    metadata: { title: '', description: '', category: '' },
    rows,
    bankItems: [],
  }
})()

function removeAt<T>(arr: T[], index: number): T[] {
  const next = arr.slice()
  next.splice(index, 1)
  return next
}

function insertAt<T>(arr: T[], index: number, value: T): T[] {
  const next = arr.slice()
  next.splice(index, 0, value)
  return next
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}

export const useTierEditor = create<State & Actions>((set) => ({
  ...initialState,
  setMetadata: (patch) =>
    set((s) => ({ metadata: { ...s.metadata, ...patch } })),
  addUploadingItem: (name) => {
    const id = newId()
    set((s) => ({
      bankItems: [...s.bankItems, { id, name, status: 'uploading' }],
    }))
    return id
  },
  markItemUploaded: (id, url) =>
    set((s) => ({
      bankItems: s.bankItems.map((i) =>
        i.id === id ? { ...i, status: 'uploaded', url } : i
      ),
    })),
  markItemError: (id) =>
    set((s) => ({
      bankItems: s.bankItems.map((i) =>
        i.id === id ? { ...i, status: 'error' } : i
      ),
    })),
  removeItem: (input) =>
    set((s) => {
      if (input.source === 'bank') {
        return { bankItems: s.bankItems.filter((i) => i.id !== input.id) }
      }
      return {
        rows: s.rows.map((r) =>
          r.id === input.rowId
            ? { ...r, items: r.items.filter((i) => i.id !== input.id) }
            : r
        ),
      }
    }),
  moveItem: (input) =>
    set((s) => {
      const { source, sourceId, sourceIndex, target, targetId, targetIndex } = input

      const fromList: TierItem[] =
        source === 'bank'
          ? s.bankItems
          : s.rows.find((r) => r.id === sourceId)?.items ?? []
      if (sourceIndex < 0 || sourceIndex >= fromList.length) return s
      const item = fromList[sourceIndex]

      const withoutItem: State =
        source === 'bank'
          ? { ...s, bankItems: removeAt(s.bankItems, sourceIndex) }
          : {
              ...s,
              rows: s.rows.map((r) =>
                r.id === sourceId
                  ? { ...r, items: removeAt(r.items, sourceIndex) }
                  : r
              ),
            }

      if (target === 'bank') {
        return {
          ...withoutItem,
          bankItems: insertAt(withoutItem.bankItems, targetIndex, item),
        }
      }

      return {
        ...withoutItem,
        rows: withoutItem.rows.map((r) => {
          if (r.id !== targetId) return r
          return { ...r, items: insertAt(r.items, targetIndex, item) }
        }),
      }
    }),
  updateRow: (id, patch) =>
    set((s) => ({
      rows: s.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
  addRow: () =>
    set((s) => {
      if (s.rows.length >= 10) return s
      return {
        rows: [
          ...s.rows,
          { id: newId(), label: '?', color: '#6b7280', items: [] },
        ],
      }
    }),
  removeRow: (id) =>
    set((s) => {
      if (s.rows.length <= 1) return s
      const row = s.rows.find((r) => r.id === id)
      const rescued = row ? row.items : []
      return {
        rows: s.rows.filter((r) => r.id !== id),
        bankItems: [...s.bankItems, ...rescued],
      }
    }),
  reset: () => set(initialState),
  initFromDb: (data) =>
    set({
      metadata: {
        title: data.title,
        description: data.description ?? '',
        category: data.category,
      },
      bankItems: data.sidebarItems.map((url) => ({
        id: newId(),
        url,
        status: 'uploaded' as TierItemStatus,
      })),
      rows: data.rows.map((r) => ({
        id: r.id,
        label: r.label,
        color: r.color,
        items: r.items.map((url) => ({
          id: newId(),
          url,
          status: 'uploaded' as TierItemStatus,
        })),
      })),
    }),
}))

export function collectSavedItemUrls(state: State): string[] {
  const urls: string[] = []
  for (const i of state.bankItems) {
    if (i.status === 'uploaded' && i.url) urls.push(i.url)
  }
  for (const r of state.rows) {
    for (const i of r.items) {
      if (i.status === 'uploaded' && i.url) urls.push(i.url)
    }
  }
  return urls
}

export function hasPendingUploads(state: State): boolean {
  return (
    state.bankItems.some((i) => i.status === 'uploading') ||
    state.rows.some((r) => r.items.some((i) => i.status === 'uploading'))
  )
}

export function buildSavePayload(state: State): {
  title: string
  description?: string
  category: string
  rows: { id: string; label: string; color: string; items: string[] }[]
  bankItems: string[]
} {
  return {
    title: state.metadata.title.trim(),
    description: state.metadata.description.trim() || undefined,
    category: state.metadata.category.trim(),
    rows: state.rows.map((r) => ({
      id: r.id,
      label: r.label,
      color: r.color,
      items: r.items
        .filter((i) => i.status === 'uploaded' && i.url)
        .map((i) => i.url as string),
    })),
    bankItems: state.bankItems
      .filter((i) => i.status === 'uploaded' && i.url)
      .map((i) => i.url as string),
  }
}
