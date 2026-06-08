'use client'

import { useEffect } from 'react'
import { useTierEditor, initialState } from '@/lib/stores/tier-editor'
import { getTierFill, setTierFill } from '@/lib/idb/tier-fill-store'
import { buildTierFillKey } from '@/lib/idb/tier-fill-key'
import { mergeTierFill } from '@/lib/idb/merge-tier-fill'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'

const DEBOUNCE_MS = 500

export function useTierFillPersistence(
  tierId: string,
  userId: string | null,
  seed: TierListDetailSeed
): void {
  useEffect(() => {
    const key = buildTierFillKey(userId, tierId)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let seeded = false

    async function init() {
      try {
        const draft = await getTierFill(key)
        const merged = mergeTierFill(seed, draft)
        useTierEditor.setState((s) => ({
          ...s,
          metadata: {
            title: seed.title,
            description: seed.description ?? '',
            category: seed.category,
            coverImageUrl: seed.coverImageUrl ?? undefined,
          },
          rows: merged.rows,
          bankItems: merged.bankItems,
        }))
      } catch {
        useTierEditor.getState().initFromDb(seed)
      } finally {
        seeded = true
      }
    }

    init()

    const unsubscribe = useTierEditor.subscribe((state) => {
      if (!seeded) return
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const draft = {
          rows: state.rows.map((r) => ({
            ...r,
            items: r.items.filter((i) => i.status !== 'uploading'),
          })),
          bankItems: state.bankItems.filter((i) => i.status !== 'uploading'),
        }
        setTierFill(key, draft).catch(() => {})
      }, DEBOUNCE_MS)
    })

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      unsubscribe()
      useTierEditor.setState(initialState)
    }
  }, [userId, tierId, seed])
}
