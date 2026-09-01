/**
 * Parses any CSS color string (oklch, lab, color(), rgb(), hex, named) into
 * a normalized hex string the rest of the picker understands.
 *
 * Strategy:
 * 1. Try to parse the string with the `color` package (handles hex, rgb, hsl, named).
 * 2. If that fails, render the color into a 1×1 canvas pixel and read the
 *    sRGB result back via `getImageData`. The browser's CSS engine handles
 *    every modern color space (oklch, lab, color()) natively.
 * 3. As a last resort, fall back to #000000.
 */
import Color from 'color'

const FALLBACK = '#000000'

let canvasCtx: CanvasRenderingContext2D | null = null
let canvasFallbackTried = false

function ensureCanvas(): CanvasRenderingContext2D | null {
  if (globalThis.document == null) return null
  if (canvasCtx) return canvasCtx
  if (canvasFallbackTried) return null
  canvasFallbackTried = true
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  canvasCtx = ctx
  return ctx
}

function fromCanvas(value: string): string | null {
  const ctx = ensureCanvas()
  if (!ctx) return null
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000000'
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const data = ctx.getImageData(0, 0, 1, 1).data
  if (data[3] === 0) return null
  const r = data[0]
  const g = data[1]
  const b = data[2]
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
}

export type ParsedCssColor = {
  hex: string
  alpha: number
}

function toHex(value: string): ParsedCssColor {
  const parsed = Color(value)
  return { hex: parsed.hex().toLowerCase(), alpha: parsed.alpha() }
}

export function parseCssColor(value: string): ParsedCssColor {
  try {
    return toHex(value)
  } catch {
    const fromCss = fromCanvas(value)
    if (fromCss) return { hex: fromCss.toLowerCase(), alpha: 1 }
    return { hex: FALLBACK, alpha: 1 }
  }
}
