'use client'

import { useCallback, useRef, useState } from 'react'
import type { DropResult, ResponderProvided } from '@hello-pangea/dnd'
import {
  useTierEditor,
  type EditorTierRow,
  type TierItem,
} from '@/lib/stores/tier-editor'
import { BANK_DROPPABLE, rowIdFromDroppableId } from './tier-dnd-constants'

type EditorSnapshot = {
  rows: EditorTierRow[]
  bankItems: TierItem[]
}

export function useTierDnd() {
  const historyRef = useRef<EditorSnapshot[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const onDragEnd = useCallback(
    (result: DropResult, provided?: ResponderProvided) => {
      const { source, destination } = result
      if (!destination) {
        if (result.reason === 'CANCEL') {
          const message = 'Move cancelled.'
          provided?.announce(message)
        }
        return
      }
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return

      const state = useTierEditor.getState()
      const fromBank = source.droppableId === BANK_DROPPABLE
      const toBank = destination.droppableId === BANK_DROPPABLE
      const sourceItems = fromBank
        ? state.bankItems
        : state.rows.find(
            (row) => row.id === rowIdFromDroppableId(source.droppableId)
          )?.items
      const item = sourceItems?.[source.index]
      if (!item) return

      historyRef.current.push({ rows: state.rows, bankItems: state.bankItems })

      state.moveItem({
        source: fromBank ? 'bank' : 'row',
        sourceId: fromBank
          ? undefined
          : rowIdFromDroppableId(source.droppableId),
        sourceIndex: source.index,
        target: toBank ? 'bank' : 'row',
        targetId: toBank
          ? undefined
          : rowIdFromDroppableId(destination.droppableId),
        targetIndex: destination.index,
      })

      const nextState = useTierEditor.getState()
      if (
        nextState.rows === state.rows &&
        nextState.bankItems === state.bankItems
      ) {
        historyRef.current.pop()
        return
      }

      setCanUndo(true)
      const destinationLabel = toBank
        ? 'Items to place'
        : (state.rows.find(
            (row) => row.id === rowIdFromDroppableId(destination.droppableId)
          )?.label ?? 'the tier list')
      const message = `Moved ${item.label} to ${destinationLabel}.`
      provided?.announce(message)
    },
    []
  )

  const undoLastMove = useCallback(() => {
    const previous = historyRef.current.pop()
    if (!previous) return false

    useTierEditor.setState({
      rows: previous.rows,
      bankItems: previous.bankItems,
    })
    setCanUndo(historyRef.current.length > 0)
    setAnnouncement('Last move undone.')
    return true
  }, [])

  const clearHistory = useCallback(() => {
    historyRef.current = []
    setCanUndo(false)
  }, [])

  return {
    announcement,
    canUndo,
    clearHistory,
    onDragEnd,
    undoLastMove,
  }
}
