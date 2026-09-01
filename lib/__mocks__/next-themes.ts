import { vi } from 'vitest'
import type { ReactNode } from 'react'

export const mockSetTheme = vi.fn()
export const mockTheme = { resolvedTheme: 'dark' as string | undefined }

export function useTheme() {
  return { resolvedTheme: mockTheme.resolvedTheme, setTheme: mockSetTheme }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return children
}
