import { describe, it, expect, vi } from 'vitest'
import { parseCssColor } from './parse-css-color'

describe('parseCssColor', () => {
  it('parses hex strings via the color package', () => {
    expect(parseCssColor('#ff0000').hex).toBe('#ff0000')
    expect(parseCssColor('#00ff00').hex).toBe('#00ff00')
    expect(parseCssColor('#0000ff').hex).toBe('#0000ff')
    expect(parseCssColor('#fff').hex).toBe('#ffffff')
  })

  it('parses named colors via the color package', () => {
    expect(parseCssColor('red').hex).toBe('#ff0000')
    expect(parseCssColor('blue').hex).toBe('#0000ff')
  })

  it('parses rgb() strings via the color package', () => {
    expect(parseCssColor('rgb(255, 0, 0)').hex).toBe('#ff0000')
    expect(parseCssColor('rgb(0, 128, 255)').hex).toBe('#0080ff')
  })

  it('falls back to the canvas for modern color spaces the color package cannot parse', () => {
    // jsdom has no canvas implementation by default, so fromCanvas returns null
    // and we land on the documented black fallback. In a real browser, oklch
    // would render through the CSS engine and getImageData returns sRGB.
    vi.stubGlobal('document', undefined)
    expect(parseCssColor('oklch(0.65 0.22 250)').hex).toBe('#000000')
    vi.unstubAllGlobals()
  })
})
