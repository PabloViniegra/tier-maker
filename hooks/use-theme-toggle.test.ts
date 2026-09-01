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
    const mockSVT = vi.fn((cb: () => void) => cb())
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
})
