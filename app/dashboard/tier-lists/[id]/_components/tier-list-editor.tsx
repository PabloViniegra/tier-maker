'use client'

import { useEffect, useRef, useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import {
  useTierEditor,
  buildUpdatePayload,
  hasPendingUploads,
} from '@/lib/stores/tier-editor'
import { useTierDnd } from '@/lib/hooks/use-tier-dnd'
import { TierBoard } from '@/app/dashboard/tier-lists/new/_components/tier-board'
import { updateTierListAction } from '../actions'
import { ItemBankStrip } from './item-bank-strip'
import { SaveIndicator, type SaveState } from './save-indicator'
import { ExportButton } from './export-button'
import { PageHeader } from '@/components/page-header'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'

type Props = {
  id: string
  data: TierListDetailSeed
}

export function TierListEditor({ id, data }: Props) {
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const boardRef = useRef<HTMLElement>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    useTierEditor.getState().initFromDb(data)

    let seeded = false
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    // Defer seeded flag so initFromDb state change is skipped
    const raf = requestAnimationFrame(() => {
      seeded = true
    })

    const unsubscribe = useTierEditor.subscribe(() => {
      if (!seeded) return
      if (debounceTimer) clearTimeout(debounceTimer)
      setSaveState('saving')
      debounceTimer = setTimeout(async () => {
        const state = useTierEditor.getState()
        if (hasPendingUploads(state)) return
        try {
          const payload = buildUpdatePayload(state)
          await updateTierListAction(id, payload)
          setSaveState('saved')
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
          savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2000)
        } catch (err) {
          setSaveState('error')
          const message = err instanceof Error ? err.message : 'Save failed'
          toast.error(message)
        }
      }, 1500)
    })

    return () => {
      cancelAnimationFrame(raf)
      if (debounceTimer) clearTimeout(debounceTimer)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      unsubscribe()
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { onDragEnd } = useTierDnd()

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <PageHeader backHref="/dashboard/tier-lists" title={data.title}>
        <SaveIndicator state={saveState} />
        <ExportButton boardRef={boardRef} title={data.title} />
      </PageHeader>

      {/* Single DragDropContext wraps both board and bank */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Board — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <TierBoard rowMinHeight="24" boardRef={boardRef} />
        </div>

        {/* Item bank — pinned at bottom */}
        <div className="shrink-0">
          <ItemBankStrip />
        </div>
      </DragDropContext>
    </div>
  )
}
