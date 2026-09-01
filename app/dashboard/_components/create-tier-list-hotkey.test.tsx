import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { mockPush } from '@/lib/__mocks__/next-navigation'
import { CreateTierListHotkey } from './create-tier-list-hotkey'

describe('CreateTierListHotkey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens the tier list creator when N is pressed', () => {
    render(<CreateTierListHotkey />)
    fireEvent.keyDown(window, { key: 'n' })
    expect(mockPush).toHaveBeenCalledWith('/dashboard/tier-lists/new')
  })

  it.each([
    { shiftKey: true },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
  ])('ignores N with modifiers: %o', (modifier) => {
    render(<CreateTierListHotkey />)
    fireEvent.keyDown(window, { key: 'n', ...modifier })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('ignores N while typing in an input', () => {
    const { getByRole } = render(
      <>
        <CreateTierListHotkey />
        <input aria-label="Title" />
      </>
    )
    fireEvent.keyDown(getByRole('textbox'), { key: 'n' })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
