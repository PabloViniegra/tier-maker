import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as themeToggle from '@/hooks/use-theme-toggle'
import { ThemeToggleButton } from './theme-toggle-button'

const toggleTheme = vi.fn()

function stubTheme(theme: string | undefined) {
  vi.spyOn(themeToggle, 'useThemeToggle').mockReturnValue({
    theme,
    toggleTheme,
  })
}

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    toggleTheme.mockClear()
  })

  it('renders button even when theme is undefined (pre-hydration, defaults to dark)', () => {
    stubTheme(undefined)
    render(<ThemeToggleButton />)
    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument()
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
  })

  it('renders button with aria-label', () => {
    stubTheme('dark')
    render(<ThemeToggleButton />)
    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument()
  })

  it('shows Sun icon in dark mode', () => {
    stubTheme('dark')
    render(<ThemeToggleButton />)
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
  })

  it('shows Moon icon in light mode', () => {
    stubTheme('light')
    render(<ThemeToggleButton />)
    expect(screen.getByTestId('icon-moon')).toBeInTheDocument()
  })

  it('calls toggleTheme on click', async () => {
    stubTheme('dark')
    const user = userEvent.setup()
    render(<ThemeToggleButton />)
    await user.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(toggleTheme).toHaveBeenCalledOnce()
  })
})
