'use client'

import { useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const activeTransition = useRef<ViewTransition | null>(null)

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'

    const apply = () => {
      document.documentElement.classList.toggle('dark', next === 'dark')
      setTheme(next)
    }

    if (document.startViewTransition) {
      const root = document.documentElement
      root.classList.add('theme-transition')
      const transition = document.startViewTransition(apply)
      activeTransition.current = transition
      transition.finished.finally(() => {
        if (activeTransition.current !== transition) return
        activeTransition.current = null
        root.classList.remove('theme-transition')
      })
    } else {
      apply()
    }
  }, [resolvedTheme, setTheme])

  return { theme: resolvedTheme, toggleTheme }
}
