import { describe, it, expect } from 'vitest'
import { htmlSafeJson } from './html-safe-json'

describe('htmlSafeJson', () => {
  it('serializes a website JSON-LD document', () => {
    expect(
      htmlSafeJson({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Tier Maker',
        url: 'https://tiermaker.pabloviniegra.dev',
      })
    ).toBe(
      '{"@context":"https://schema.org","@type":"WebSite","name":"Tier Maker","url":"https://tiermaker.pabloviniegra.dev"}'
    )
  })

  it('escapes characters that can break out of a script tag', () => {
    const encoded = htmlSafeJson({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '</script><script>alert(1)',
      url: 'https://example.com/?a=1&b=2',
    })
    expect(encoded).not.toContain('<')
    expect(encoded).not.toContain('>')
    expect(encoded).not.toContain('&')
    expect(JSON.parse(encoded)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '</script><script>alert(1)',
      url: 'https://example.com/?a=1&b=2',
    })
  })
})
