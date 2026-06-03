'use client'

import { useCallback } from 'react'
import { useTheme } from 'next-themes'

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'

    const apply = () => {
      document.documentElement.classList.toggle('dark', next === 'dark')
      setTheme(next)
    }

    if (document.startViewTransition) {
      document.startViewTransition(apply)
    } else {
      apply()
    }
  }, [resolvedTheme, setTheme])

  return { theme: resolvedTheme, toggleTheme }
}
