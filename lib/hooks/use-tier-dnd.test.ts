import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { DropResult } from '@hello-pangea/dnd'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { droppableIdForRow } from './tier-dnd-constants'
import { useTierDnd } from './use-tier-dnd'

describe('useTierDnd', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('undoes the last completed move', () => {
    const itemId = useTierEditor.getState().addUploadingItem('Item A')
    useTierEditor.getState().markItemUploaded(itemId, 'https://img/a.png')
    const rowId = useTierEditor.getState().rows[0].id
    const { result } = renderHook(() => useTierDnd())
    const announce = vi.fn()
    const dragResult: DropResult = {
      reason: 'DROP',
      mode: 'FLUID',
      draggableId: itemId,
      type: 'DEFAULT',
      source: { droppableId: 'bank', index: 0 },
      destination: { droppableId: droppableIdForRow(rowId), index: 0 },
      combine: null,
    }

    act(() => {
      result.current.onDragEnd(dragResult, { announce })
    })

    expect(useTierEditor.getState().rows[0].items).toHaveLength(1)
    expect(result.current.canUndo).toBe(true)
    expect(announce).toHaveBeenCalledWith('Moved Item A to S.')

    act(() => {
      result.current.undoLastMove()
    })

    expect(useTierEditor.getState().rows[0].items).toHaveLength(0)
    expect(useTierEditor.getState().bankItems).toHaveLength(1)
    expect(result.current.canUndo).toBe(false)
  })
})
