import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const { mockSetTheme } = vi.hoisted(() => ({
  mockSetTheme: vi.fn(),
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark', setTheme: mockSetTheme }),
}))

import { useThemeToggle } from './use-theme-toggle'

describe('useThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete (document as unknown as Record<string, unknown>).startViewTransition
  })

  it('returns current theme from resolvedTheme', () => {
    const { result } = renderHook(() => useThemeToggle())
    expect(result.current.theme).toBe('dark')
  })

  it('toggleTheme calls setTheme with opposite of current theme', () => {
    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('toggleTheme calls startViewTransition when available', () => {
    const mockSVT = vi.fn((cb: () => void) => cb())
    document.startViewTransition = mockSVT as unknown as Document['startViewTransition']

    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    expect(mockSVT).toHaveBeenCalled()
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('toggleTheme falls back to direct setTheme when startViewTransition unavailable', () => {
    const { result } = renderHook(() => useThemeToggle())
    act(() => result.current.toggleTheme())
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
