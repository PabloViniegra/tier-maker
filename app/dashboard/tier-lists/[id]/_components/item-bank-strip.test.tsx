import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DragDropContext } from '@hello-pangea/dnd'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { ItemBankStrip } from './item-bank-strip'

describe('ItemBankStrip', () => {
  afterEach(() => {
    useTierEditor.getState().reset()
  })

  beforeEach(() => {
    useTierEditor.getState().reset()
    useTierEditor.setState({
      bankItems: [
        {
          id: 'item-1',
          label: 'One',
          status: 'uploaded',
          url: 'https://blob/one.png',
        },
      ],
    })
  })

  it('wraps items instead of scrolling sideways', () => {
    render(
      <DragDropContext onDragEnd={() => undefined}>
        <ItemBankStrip showInstructions />
      </DragDropContext>
    )
    const list = screen.getByText(/items to place/i).parentElement
      ?.nextElementSibling
    expect(list).toHaveClass('flex-wrap')
    expect(list).not.toHaveClass('overflow-x-auto')
  })
})
