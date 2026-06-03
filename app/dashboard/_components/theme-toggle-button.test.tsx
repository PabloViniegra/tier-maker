import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { mockToggleTheme, mockTheme } = vi.hoisted(() => ({
  mockToggleTheme: vi.fn(),
  mockTheme: { value: 'dark' as string | undefined },
}))

vi.mock('@/hooks/use-theme-toggle', () => ({
  useThemeToggle: () => ({
    theme: mockTheme.value,
    toggleTheme: mockToggleTheme,
  }),
}))

import { ThemeToggleButton } from './theme-toggle-button'

describe('ThemeToggleButton', () => {
  it('renders button even when theme is undefined (pre-hydration, defaults to dark)', () => {
    mockTheme.value = undefined
    render(<ThemeToggleButton />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
  })

  it('renders button with aria-label', () => {
    mockTheme.value = 'dark'
    render(<ThemeToggleButton />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('shows Sun icon in dark mode', () => {
    mockTheme.value = 'dark'
    render(<ThemeToggleButton />)
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
  })

  it('shows Moon icon in light mode', () => {
    mockTheme.value = 'light'
    render(<ThemeToggleButton />)
    expect(screen.getByTestId('icon-moon')).toBeInTheDocument()
  })

  it('calls toggleTheme on click', async () => {
    mockTheme.value = 'dark'
    const user = userEvent.setup()
    render(<ThemeToggleButton />)
    await user.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(mockToggleTheme).toHaveBeenCalledOnce()
  })
})
