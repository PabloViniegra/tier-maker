import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'

import { useUnsavedChangesGuard } from './use-unsaved-changes-guard'

describe('useUnsavedChangesGuard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('blocks navigation when the user rejects the confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { result } = renderHook(() => useUnsavedChangesGuard(true))
    render(
      <a href="#dashboard" onClick={result.current}>
        Dashboard
      </a>
    )
    const link = screen.getByRole('link', { name: 'Dashboard' })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    fireEvent(link, event)

    expect(window.confirm).toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)
  })

  it('allows navigation when there are no unsaved changes', () => {
    const confirm = vi.spyOn(window, 'confirm')
    const { result } = renderHook(() => useUnsavedChangesGuard(false))
    render(
      <a href="#dashboard" onClick={result.current}>
        Dashboard
      </a>
    )
    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(confirm).not.toHaveBeenCalled()
  })

  it('blocks unloading while changes are unsaved', () => {
    renderHook(() => useUnsavedChangesGuard(true))
    const event = new Event('beforeunload', { cancelable: true })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(event.defaultPrevented).toBe(true)
  })
})
