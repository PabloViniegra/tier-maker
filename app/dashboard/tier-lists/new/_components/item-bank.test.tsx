import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { ItemBank } from './item-bank'
import { deleteImagesAction } from '../../_actions/delete-images'

// eslint-disable-next-line anti-slop/no-module-mocking
vi.mock('../../_actions/delete-images', () => ({
  deleteImagesAction: vi.fn().mockResolvedValue({ ok: true }),
}))

describe('ItemBank', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.clearAllMocks()
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

  it('keeps an item when removal is not confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(<ItemBank onPickFiles={() => undefined} />)

    await user.click(
      screen.getByRole('button', { name: /remove princess mononoke/i })
    )

    expect(window.confirm).toHaveBeenCalled()
    expect(useTierEditor.getState().bankItems).toHaveLength(1)
  })

  it('purges a confirmed uploaded item when no committed URLs are provided', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<ItemBank onPickFiles={() => undefined} />)

    await user.click(
      screen.getByRole('button', { name: /remove princess mononoke/i })
    )

    expect(deleteImagesAction).toHaveBeenCalledWith([
      'https://blob/mononoke.png',
    ])
    expect(useTierEditor.getState().bankItems).toHaveLength(0)
  })

  it('removes a confirmed item without purging a committed URL', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(
      <ItemBank
        onPickFiles={() => undefined}
        committedUrls={new Set(['https://blob/mononoke.png'])}
      />
    )

    await user.click(
      screen.getByRole('button', { name: /remove princess mononoke/i })
    )

    expect(deleteImagesAction).not.toHaveBeenCalled()
    expect(useTierEditor.getState().bankItems).toHaveLength(0)
  })

  it('purges a confirmed uploaded URL not committed in edit mode', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(
      <ItemBank
        onPickFiles={() => undefined}
        committedUrls={new Set(['https://blob/other.png'])}
      />
    )

    await user.click(
      screen.getByRole('button', { name: /remove princess mononoke/i })
    )

    expect(deleteImagesAction).toHaveBeenCalledWith([
      'https://blob/mononoke.png',
    ])
    expect(useTierEditor.getState().bankItems).toHaveLength(0)
  })
})

describe('ItemBank paste discoverability', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('tells an empty bank that paste works', () => {
    render(<ItemBank onPickFiles={() => undefined} />)

    expect(
      screen.getByText('Paste, drop, or upload to start')
    ).toBeInTheDocument()
  })

  it('shows a paste shortcut on the upload button without changing its name', () => {
    render(<ItemBank onPickFiles={() => undefined} />)

    const button = screen.getByRole('button', { name: 'Upload images' })
    expect(button).toHaveTextContent('Ctrl+V')
  })

  it('keeps format limits as the only helper under the button', () => {
    render(<ItemBank onPickFiles={() => undefined} />)

    expect(
      screen.getByText('JPG, PNG, WEBP, GIF up to 5 MB each.')
    ).toBeInTheDocument()
    expect(screen.queryByText(/paste \(Ctrl\+V\)/i)).not.toBeInTheDocument()
  })
})
