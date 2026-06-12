import { openDB, type IDBPDatabase } from 'idb'
import type { EditorTierRow, TierItem } from '@/lib/stores/tier-editor'

const DB_NAME = 'tier-maker'
const STORE_NAME = 'tier-fills'
const DB_VERSION = 1

export type TierFillDraft = {
  rows: Array<Pick<EditorTierRow, 'id' | 'label' | 'color' | 'items'>>
  bankItems: TierItem[]
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

export async function getTierFill(key: string): Promise<TierFillDraft | null> {
  const db = await getDb()
  return (await db.get(STORE_NAME, key)) ?? null
}

export async function setTierFill(
  key: string,
  draft: TierFillDraft
): Promise<void> {
  const db = await getDb()
  await db.put(STORE_NAME, draft, key)
}

export async function deleteTierFill(key: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, key)
}
