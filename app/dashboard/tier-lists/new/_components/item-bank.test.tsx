import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { ItemBank } from './item-bank'

describe('ItemBank', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
    useTierEditor.setState({
      bankItems: [
        {
          id: 'item-1',
          label: 'Princess Mononoke',
          status: 'uploaded',
          url: 'https://blob/mononoke.png',
        },
      ],
    })
  })

  it('moves an image to a tier without dragging', async () => {
    const user = userEvent.setup()
    render(<ItemBank onPickFiles={() => undefined} />)

    await user.click(
      screen.getByRole('button', { name: /move princess mononoke to a tier/i })
    )
    await user.click(
      await screen.findByRole('menuitem', { name: /S tier, row 1/i })
    )

    const state = useTierEditor.getState()
    expect(state.bankItems).toHaveLength(0)
    expect(state.rows[0].items).toEqual([
      expect.objectContaining({ id: 'item-1' }),
    ])
  })

  it('supports keyboard placement and restores focus to image intake', async () => {
    const user = userEvent.setup()
    render(<ItemBank onPickFiles={() => undefined} />)

    const trigger = screen.getByRole('button', {
      name: /move princess mononoke to a tier/i,
    })
    trigger.focus()
    await user.keyboard('{Enter}{ArrowDown}{Enter}')

    expect(useTierEditor.getState().rows[1].items).toEqual([
      expect.objectContaining({ id: 'item-1' }),
    ])
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Upload images' })
      ).toHaveFocus()
    )
  })

  it('distinguishes rows with duplicate labels', async () => {
    const user = userEvent.setup()
    const rows = useTierEditor
      .getState()
      .rows.map((row, index) => (index < 2 ? { ...row, label: 'S' } : row))
    useTierEditor.setState({ rows })
    render(<ItemBank onPickFiles={() => undefined} />)

    await user.click(
      screen.getByRole('button', { name: /move princess mononoke to a tier/i })
    )

    expect(
      await screen.findByRole('menuitem', { name: /S tier, row 1/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /S tier, row 2/i })
    ).toBeInTheDocument()
  })
})
