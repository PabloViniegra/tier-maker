'use client'

import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeToggle } from '@/hooks/use-theme-toggle'

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useThemeToggle()
  const isDark = theme !== 'light'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      suppressHydrationWarning
    >
      {isDark ? (
        <Sun
          size={14}
          strokeWidth={1.5}
          data-testid="icon-sun"
          aria-hidden="true"
        />
      ) : (
        <Moon
          size={14}
          strokeWidth={1.5}
          data-testid="icon-moon"
          aria-hidden="true"
        />
      )}
    </Button>
  )
}
