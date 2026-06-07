'use client'

import { useEffect, useRef } from 'react'
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
  // seed is static (server-provided) for the lifetime of this page — capture in ref
  // so the effect only re-runs when the identity (tierId/userId) actually changes
  const seedRef = useRef(seed)
  seedRef.current = seed

  useEffect(() => {
    const key = buildTierFillKey(userId, tierId)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let seeded = false

    async function init() {
      const currentSeed = seedRef.current
      try {
        const draft = await getTierFill(key)
        const merged = mergeTierFill(currentSeed, draft)
        useTierEditor.setState((s) => ({
          ...s,
          metadata: {
            title: currentSeed.title,
            description: currentSeed.description ?? '',
            category: currentSeed.category,
            coverImageUrl: currentSeed.coverImageUrl ?? undefined,
          },
          rows: merged.rows,
          bankItems: merged.bankItems,
        }))
      } catch {
        useTierEditor.getState().initFromDb(currentSeed)
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
  }, [userId, tierId]) // eslint-disable-line react-hooks/exhaustive-deps
}
