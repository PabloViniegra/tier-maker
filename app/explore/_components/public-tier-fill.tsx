'use client'

import { useRef } from 'react'
import { useHydrated } from '@/lib/hooks/use-hydrated'
import { DragDropContext } from '@hello-pangea/dnd'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { useTierDnd } from '@/lib/hooks/use-tier-dnd'
import { TierBoard } from '@/app/dashboard/tier-lists/new/_components/tier-board'
import { ItemBankStrip } from '@/app/dashboard/tier-lists/[id]/_components/item-bank-strip'
import { ExportButton } from '@/app/dashboard/tier-lists/[id]/_components/export-button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTierFillPersistence } from '@/lib/hooks/use-tier-fill-persistence'
import { PublicTierBoard } from './public-tier-board'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'
import type { PublicTierRowData } from './public-tier-row'

type Props = {
  tierId: string
  data: TierListDetailSeed
  backHref?: string
}

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

export function PublicTierFill({ tierId, data, backHref = '/explore' }: Props) {
  const boardRef = useRef<HTMLElement>(null)
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null
  const hydrated = useHydrated()

  // Initialize Zustand store + IndexedDB persistence in the background.
  useTierFillPersistence(tierId, userId, data)

  const { onDragEnd } = useTierDnd()

  // Derive static props once — used for the non-hydrated phase only.
  const rows: PublicTierRowData[] = deriveRowsForPersistence(data)
  const sidebarItems = data.sidebarItems.map((item) => ({
    url: item.url ?? '',
    label: item.label,
  }))

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-3">
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
          <h1 className="line-clamp-1 min-w-0 font-heading text-lg">
            {data.title}
          </h1>
        </div>
        <ExportButton boardRef={boardRef} title={data.title} />
      </header>

      {hydrated ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Announce drag operations to screen readers */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            id="dnd-announcements"
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <TierBoard rowMinHeight="24" boardRef={boardRef} mode="fill" />
          </div>
          <div className="shrink-0">
            <ItemBankStrip />
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
