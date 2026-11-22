import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from 'next-themes'
import { useThemeToggle } from './use-theme-toggle'

describe('useThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: undefined,
    })
  })

  it('returns current theme from resolvedTheme', () => {
    const { result } = renderHook(() => useThemeToggle())
    expect(result.current.theme).toBe('dark')
  })

  it('toggleTheme calls setTheme with opposite of current theme', () => {
    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    expect(useTheme().setTheme).toHaveBeenCalledWith('light')
  })

  it('toggleTheme calls startViewTransition when available', () => {
    const mockSVT = vi.fn((cb: () => void) => {
      cb()
      return { finished: Promise.resolve() }
    })
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: mockSVT,
    })

    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    expect(mockSVT).toHaveBeenCalled()
    expect(useTheme().setTheme).toHaveBeenCalledWith('light')
  })

  it('toggleTheme falls back to direct setTheme when startViewTransition unavailable', () => {
    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    expect(useTheme().setTheme).toHaveBeenCalledWith('light')
  })

  it('scopes the circular reveal class to the theme transition', async () => {
    let finish!: () => void
    const finished = new Promise<void>((resolve) => (finish = resolve))
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: vi.fn((cb: () => void) => {
        cb()
        return { finished }
      }),
    })

    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    expect(document.documentElement).toHaveClass('theme-transition')

    await act(async () => {
      finish()
      await finished
    })
    expect(document.documentElement).not.toHaveClass('theme-transition')
  })

  it('keeps the reveal class until the latest overlapping toggle finishes', async () => {
    const resolvers: (() => void)[] = []
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: vi.fn((cb: () => void) => {
        cb()
        return {
          finished: new Promise<void>((resolve) => resolvers.push(resolve)),
        }
      }),
    })

    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    act(() => result.current.toggleTheme())

    await act(async () => resolvers[0]())
    expect(document.documentElement).toHaveClass('theme-transition')

    await act(async () => resolvers[1]())
    expect(document.documentElement).not.toHaveClass('theme-transition')
  })
})
