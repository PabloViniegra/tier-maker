'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTierEditor, initialState } from '@/lib/stores/tier-editor'
import {
  deleteTierFill,
  getTierFill,
  setTierFill,
} from '@/lib/idb/tier-fill-store'
import { buildTierFillKey } from '@/lib/idb/tier-fill-key'
import { mergeTierFill } from '@/lib/idb/merge-tier-fill'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'

const DEBOUNCE_MS = 500

export type TierFillPersistenceStatus =
  | 'loading'
  | 'ready'
  | 'saving'
  | 'saved'
  | 'error'

export function useTierFillPersistence(
  tierId: string,
  userId: string | null,
  seed: TierListDetailSeed
) {
  const seedRef = useRef(seed)
  const keyRef = useRef<string | null>(userId ? `${userId}:${tierId}` : null)
  const activeInstanceRef = useRef<symbol | null>(null)
  const [status, setStatus] = useState<TierFillPersistenceStatus>('loading')

  useEffect(() => {
    seedRef.current = seed
  }, [seed])

  const resetDraft = useCallback(async () => {
    const key = keyRef.current
    const activeInstance = activeInstanceRef.current
    if (!key || !activeInstance) return false

    setStatus('saving')
    try {
      await deleteTierFill(key)
      if (activeInstanceRef.current !== activeInstance) return false

      const current = seedRef.current
      const merged = mergeTierFill(current, null)
      useTierEditor.setState({
        metadata: {
          title: current.title,
          description: current.description ?? '',
          category: current.category,
          coverImageUrl: current.coverImageUrl ?? undefined,
        },
        rows: merged.rows,
        bankItems: merged.bankItems,
      })
      setStatus('saved')
      return true
    } catch {
      if (activeInstanceRef.current !== activeInstance) return false

      setStatus('error')
      return false
    }
  }, [])

  useEffect(() => {
    const activeInstance = Symbol('tier-fill-persistence')
    activeInstanceRef.current = activeInstance
    const activeKey = userId
      ? `${userId}:${tierId}`
      : buildTierFillKey(null, tierId)
    keyRef.current = activeKey

    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let seeded = false
    let cancelled = false

    async function init() {
      try {
        const draft = await getTierFill(activeKey)
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
        setStatus(draft ? 'saved' : 'ready')
      } catch {
        if (cancelled) return
        useTierEditor.getState().initFromDb(seedRef.current)
        setStatus('error')
      } finally {
        seeded = true
      }
    }

    init()

    const unsubscribe = useTierEditor.subscribe((state) => {
      if (!seeded) return
      if (debounceTimer) clearTimeout(debounceTimer)
      setStatus('saving')
      debounceTimer = setTimeout(() => {
        const draft = {
          rows: state.rows.map((r) => ({
            ...r,
            items: r.items.filter((i) => i.status !== 'uploading'),
          })),
          bankItems: state.bankItems.filter((i) => i.status !== 'uploading'),
        }
        setTierFill(activeKey, draft)
          .then(() => {
            if (!cancelled) setStatus('saved')
          })
          .catch(() => {
            if (!cancelled) setStatus('error')
          })
      }, DEBOUNCE_MS)
    })

    return () => {
      cancelled = true
      if (debounceTimer) clearTimeout(debounceTimer)
      unsubscribe()
      if (activeInstanceRef.current === activeInstance) {
        activeInstanceRef.current = null
      }
      useTierEditor.setState(initialState)
    }
  }, [tierId, userId])

  return { status, resetDraft }
}
