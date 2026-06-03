'use client'

import { useEffect, useRef, useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { useTierDnd } from '@/lib/hooks/use-tier-dnd'
import { TierBoard } from '@/app/dashboard/tier-lists/new/_components/tier-board'
import { updateTierListAction, type UpdateTierListPayload } from '../actions'
import { ItemBankStrip } from './item-bank-strip'
import { SaveIndicator, type SaveState } from './save-indicator'
import { ExportButton } from './export-button'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type Props = {
  id: string
  data: TierListDetailSeed
}

function buildUpdatePayload(state: ReturnType<typeof useTierEditor.getState>): UpdateTierListPayload {
  return {
    bankItems: state.bankItems
      .filter((i) => i.status === 'uploaded' && i.url)
      .map((i) => i.url as string),
    rows: state.rows.map((r) => ({
      id: r.id,
      label: r.label,
      color: r.color,
      items: r.items
        .filter((i) => i.status === 'uploaded' && i.url)
        .map((i) => i.url as string),
    })),
  }
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
        try {
          const payload = buildUpdatePayload(useTierEditor.getState())
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
    <div className='flex h-[calc(100vh-4rem)] flex-col'>
      {/* Sticky top bar */}
      <header className='flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-sm'>
        <div className='flex items-center gap-3'>
          <Link
            href='/dashboard/tier-lists'
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'gap-1.5 text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <h1 className='line-clamp-1 font-heading text-lg'>{data.title}</h1>
        </div>
        <div className='flex items-center gap-3'>
          <SaveIndicator state={saveState} />
          <ExportButton boardRef={boardRef} title={data.title} />
        </div>
      </header>

      {/* Single DragDropContext wraps both board and bank */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Board — scrollable */}
        <div className='min-h-0 flex-1 overflow-y-auto p-4'>
          <TierBoard rowMinHeight='24' boardRef={boardRef} />
        </div>

        {/* Item bank — pinned at bottom */}
        <div className='shrink-0'>
          <ItemBankStrip />
        </div>
      </DragDropContext>
    </div>
  )
}
