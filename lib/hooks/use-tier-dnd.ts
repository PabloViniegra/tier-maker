'use client'

import { useCallback } from 'react'
import type { DropResult } from '@hello-pangea/dnd'
import { useTierEditor } from '@/lib/stores/tier-editor'
import {
  BANK_DROPPABLE,
  rowIdFromDroppableId,
} from '@/app/dashboard/tier-lists/new/_components/constants'

export function useTierDnd() {
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return

    const fromBank = source.droppableId === BANK_DROPPABLE
    const toBank = destination.droppableId === BANK_DROPPABLE

    useTierEditor.getState().moveItem({
      source: fromBank ? 'bank' : 'row',
      sourceId: fromBank ? undefined : rowIdFromDroppableId(source.droppableId),
      sourceIndex: source.index,
      target: toBank ? 'bank' : 'row',
      targetId: toBank ? undefined : rowIdFromDroppableId(destination.droppableId),
      targetIndex: destination.index,
    })
  }, [])

  return { onDragEnd }
}
