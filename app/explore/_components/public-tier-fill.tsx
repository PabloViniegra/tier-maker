'use client'

import { useEffect, useRef } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { useTierDnd } from '@/lib/hooks/use-tier-dnd'
import { TierBoard } from '@/app/dashboard/tier-lists/new/_components/tier-board'
import { ItemBankStrip } from '@/app/dashboard/tier-lists/[id]/_components/item-bank-strip'
import { ExportButton } from '@/app/dashboard/tier-lists/[id]/_components/export-button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TierListDetailSeed } from '@/lib/stores/tier-editor'

type Props = {
  data: TierListDetailSeed
  backHref?: string
}

export function PublicTierFill({ data, backHref = '/explore' }: Props) {
  const boardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    useTierEditor.getState().initFromDb(data)
    return () => {
      useTierEditor.getState().reset()
    }
  }, [data])

  const { onDragEnd } = useTierDnd()

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'gap-1.5 text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeft size={14} />
            Explore
          </Link>
          <h1 className="line-clamp-1 font-heading text-lg">{data.title}</h1>
        </div>
        <ExportButton boardRef={boardRef} title={data.title} />
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <TierBoard rowMinHeight="24" boardRef={boardRef} />
        </div>
        <div className="shrink-0">
          <ItemBankStrip />
        </div>
      </DragDropContext>
    </div>
  )
}
