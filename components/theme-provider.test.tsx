import { afterEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { mockTheme } from '@/lib/__mocks__/next-themes'
import { ThemeProvider } from './theme-provider'

describe('ThemeProvider', () => {
  afterEach(() => {
    mockTheme.resolvedTheme = 'dark'
    document.head
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.remove())
  })

  it('keeps theme-color metadata in sync with the active theme', () => {
    const lightMeta = document.createElement('meta')
    lightMeta.name = 'theme-color'
    const darkMeta = document.createElement('meta')
    darkMeta.name = 'theme-color'
    document.head.append(lightMeta, darkMeta)

    mockTheme.resolvedTheme = 'light'
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    expect(lightMeta).toHaveAttribute('content', '#fafafa')
    expect(darkMeta).toHaveAttribute('content', '#fafafa')
  })
})
