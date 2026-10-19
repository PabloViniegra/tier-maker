import { describe, it, expect } from 'vitest'
import { detectImageType } from './image-signature'

const bytes = (...values: number[]) => Uint8Array.from(values)
const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0))

describe('detectImageType', () => {
  it.each([
    ['image/jpeg', bytes(0xff, 0xd8, 0xff, 0xe0)],
    ['image/png', bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)],
    ['image/gif', bytes(...ascii('GIF87a'))],
    ['image/gif', bytes(...ascii('GIF89a'))],
    ['image/webp', bytes(...ascii('RIFF'), 1, 2, 3, 4, ...ascii('WEBP'))],
  ])('detects %s', (type, header) => {
    expect(detectImageType(header)).toBe(type)
  })

  it.each([
    ['PDF', bytes(...ascii('%PDF-1.7'))],
    ['SVG', bytes(...ascii('<svg xmlns'))],
    ['RIFF that is not WEBP', bytes(...ascii('RIFF'), 1, 2, 3, 4, ...ascii('WAVE'))],
    ['truncated PNG', bytes(0x89, 0x50, 0x4e)],
    ['empty input', bytes()],
  ])('rejects %s', (_name, header) => {
    expect(detectImageType(header)).toBeNull()
  })
})
