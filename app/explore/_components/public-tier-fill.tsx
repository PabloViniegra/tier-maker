'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { useHydrated } from '@/lib/hooks/use-hydrated'
import { DragDropContext } from '@hello-pangea/dnd'
import { ArrowLeft, RotateCcw, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { useTierDnd } from '@/lib/hooks/use-tier-dnd'
import { TierBoard } from '@/app/dashboard/tier-lists/new/_components/tier-board'
import { ItemBankStrip } from '@/app/dashboard/tier-lists/[id]/_components/item-bank-strip'
import { ExportButton } from '@/app/dashboard/tier-lists/[id]/_components/export-button'
import { LikeButton } from '@/components/like-button'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useTierFillPersistence,
  type TierFillPersistenceStatus,
} from '@/lib/hooks/use-tier-fill-persistence'
import { useConsentStore } from '@/lib/stores/consent'
import { PublicTierBoard } from './public-tier-board'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'
import type { PublicTierRowData } from './public-tier-row'

type Props = {
  tierId: string
  data: TierListDetailSeed
  backHref?: string
  userId?: string | null
  like?: {
    templateId: string
    initialCount: number
    initialIsLiked: boolean
    isAuthenticated: boolean
  }
}

const getConsentSnapshot = () => useConsentStore.getState().status
const getPendingConsentSnapshot = () => 'pending' as const

function deriveRowsForPersistence(
  data: TierListDetailSeed
): PublicTierRowData[] {
  return data.rows.map((r) => ({
    id: r.id,
    label: r.label,
    color: r.color,
    order: r.order,
    items: r.items.map((item) => ({
      url: item.url ?? '',
      label: item.label,
    })),
  }))
}

function persistenceLabel(status: TierFillPersistenceStatus) {
  switch (status) {
    case 'loading':
      return 'Preparing your list'
    case 'ready':
      return 'Ready to edit'
    case 'saving':
      return 'Saving on this device'
    case 'saved':
      return 'Saved on this device'
    case 'error':
      return 'Local save unavailable'
  }
}

export function PublicTierFill({
  tierId,
  data,
  backHref = '/explore',
  userId = null,
  like,
}: Props) {
  const boardRef = useRef<HTMLElement>(null)
  const hydrated = useHydrated()

  // Initialize Zustand store + IndexedDB persistence in the background.
  const { status: persistenceStatus, resetDraft } = useTierFillPersistence(
    tierId,
    userId,
    data
  )

  const { announcement, canUndo, clearHistory, onDragEnd, undoLastMove } =
    useTierDnd()
  const consentStatus = useSyncExternalStore(
    useConsentStore.subscribe,
    getConsentSnapshot,
    getPendingConsentSnapshot
  )
  const [resetting, setResetting] = useState(false)

  // Derive static props once — used for the non-hydrated phase only.
  const rows: PublicTierRowData[] = deriveRowsForPersistence(data)
  const sidebarItems = data.sidebarItems.map((item) => ({
    url: item.url ?? '',
    label: item.label,
  }))
  const isInteractive = hydrated && persistenceStatus !== 'loading'

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-1 flex-col',
        consentStatus === 'pending' && 'pb-28 sm:pb-20'
      )}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-background/90 px-3 py-2 backdrop-blur-sm sm:px-4">
        <div className="flex min-w-0 flex-1 basis-full items-start gap-2 sm:basis-auto sm:items-center">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'gap-1.5 text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Explore
          </Link>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="min-w-0 truncate font-heading text-lg leading-tight">
                {data.title}
              </h1>
              {data.category && (
                <span className="max-w-32 shrink-0 truncate rounded-sm bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
                  {data.category}
                </span>
              )}
            </div>
            {(data.creatorName || data.description) && (
              <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                {data.creatorName && <span>By {data.creatorName}</span>}
                {data.creatorName && data.description && (
                  <span aria-hidden="true">·</span>
                )}
                {data.description && (
                  <span className="min-w-0 truncate">{data.description}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
          <span
            className="order-first basis-full truncate text-right text-[0.7rem] text-muted-foreground sm:order-none sm:basis-auto sm:text-xs"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {persistenceLabel(persistenceStatus)}
          </span>
          {like && <LikeButton {...like} />}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={undoLastMove}
            disabled={!canUndo}
            aria-label="Undo last move"
            title="Undo last move"
            className="min-h-11 min-w-11 sm:min-h-7 sm:min-w-0"
          >
            <Undo2 size={14} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Undo</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={resetting || persistenceStatus === 'loading'}
            aria-label="Reset tier list"
            title="Reset tier list"
            className="min-h-11 min-w-11 sm:min-h-7 sm:min-w-0"
            onClick={async () => {
              setResetting(true)
              const reset = await resetDraft()
              if (reset) clearHistory()
              setResetting(false)
            }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Reset</span>
          </Button>
          <ExportButton
            boardRef={boardRef}
            title={data.title}
            variant="default"
          />
        </div>
      </header>

      {isInteractive ? (
        <DragDropContext
          onDragEnd={onDragEnd}
          dragHandleUsageInstructions="To move an item, press Space, use the arrow keys, then press Space to place it. Press Escape to cancel."
        >
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {announcement}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            <TierBoard rowMinHeight="24" boardRef={boardRef} mode="fill" />
          </div>
          <div className="shrink-0">
            <ItemBankStrip showInstructions />
          </div>
        </DragDropContext>
      ) : (
        <PublicTierBoard
          rows={rows}
          sidebarItems={sidebarItems}
          boardRef={boardRef}
        />
      )}
    </div>
  )
}
