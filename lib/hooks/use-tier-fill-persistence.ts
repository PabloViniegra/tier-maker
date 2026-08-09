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
  const seedRef = useRef(seed)
  const key = buildTierFillKey(userId, tierId)

  useEffect(() => {
    seedRef.current = seed

    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let seeded = false
    let cancelled = false

    async function init() {
      try {
        const draft = await getTierFill(key)
        if (cancelled) return
        const current = seedRef.current
        const merged = mergeTierFill(current, draft)
        useTierEditor.setState((s) => ({
          ...s,
          metadata: {
            title: current.title,
            description: current.description ?? '',
            category: current.category,
            coverImageUrl: current.coverImageUrl ?? undefined,
          },
          rows: merged.rows,
          bankItems: merged.bankItems,
        }))
      } catch {
        if (cancelled) return
        useTierEditor.getState().initFromDb(seedRef.current)
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
      cancelled = true
      if (debounceTimer) clearTimeout(debounceTimer)
      unsubscribe()
      useTierEditor.setState(initialState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
