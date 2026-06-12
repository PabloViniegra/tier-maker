import { describe, it, expect } from 'vitest'
import { slugify, generateSlug } from './slug'

describe('slugify', () => {
  it('converts a simple title to a lowercase hyphenated slug', () => {
    expect(slugify('Best Anime')).toBe('best-anime')
  })

  it('replaces spaces and underscores with hyphens', () => {
    expect(slugify('hello world_foo')).toBe('hello-world-foo')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  -hello world-  ')).toBe('hello-world')
  })

  it('collapses multiple hyphens into one', () => {
    expect(slugify('best---anime---ever')).toBe('best-anime-ever')
  })

  it('removes special characters (emoji, brackets, punctuation)', () => {
    expect(slugify('🔥 Best Anime!!! (2024)')).toBe('best-anime-2024')
  })

  it('replaces forward and back slashes with hyphens', () => {
    expect(slugify('AC/DC vs Metallica')).toBe('ac-dc-vs-metallica')
  })

  it('strips accents but preserves base character (NFD normalization)', () => {
    expect(slugify('Pokémon Café')).toBe('pokemon-cafe')
  })

  it('truncates to maxLength (default 64)', () => {
    const long = 'a'.repeat(100)
    const result = slugify(long)
    expect(result.length).toBeLessThanOrEqual(64)
    expect(result).toBe('a'.repeat(64))
  })

  it('truncates and strips trailing hyphen at boundary', () => {
    const long = 'a'.repeat(63) + '-'
    const result = slugify(long)
    expect(result.length).toBeLessThanOrEqual(64)
    expect(result.endsWith('-')).toBe(false)
  })

  it('returns empty string for input with no valid characters', () => {
    expect(slugify('!!!\\///')).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(slugify('   ')).toBe('')
  })
})

describe('generateSlug', () => {
  it('generates a slug from title when no collision', () => {
    const slug = generateSlug('Best Anime', new Set())
    expect(slug).toBe('best-anime')
  })

  it('appends -2 on first collision', () => {
    const slug = generateSlug('Best Anime', new Set(['best-anime']))
    expect(slug).toBe('best-anime-2')
  })

  it('appends -3 when -2 also exists', () => {
    const slug = generateSlug(
      'Best Anime',
      new Set(['best-anime', 'best-anime-2'])
    )
    expect(slug).toBe('best-anime-3')
  })

  it('increments suffix when multiple collisions exist', () => {
    const slugs = new Set(['my-list', 'my-list-2', 'my-list-3', 'my-list-4'])
    const slug = generateSlug('My List', slugs)
    expect(slug).toBe('my-list-5')
  })

  it('handles title that slugifies to an empty string', () => {
    const slug = generateSlug('!!!', new Set())
    // Should fall back to something reasonable
    expect(slug.length).toBeGreaterThan(0)
  })

  it('respects custom maxLength', () => {
    const long = 'X'.repeat(80)
    const slug = generateSlug(long, new Set(), 32)
    expect(slug.length).toBeLessThanOrEqual(32)
    expect(slug).toBe('x'.repeat(32))
  })

  it('trims suffix to fit within maxLength', () => {
    const long = 'X'.repeat(62) // slugify => 62 chars
    const slug = generateSlug(long, new Set([long.toLowerCase()]), 64)
    // With -2 suffix (2 chars), base must be ≤ 62 to fit the suffix
    expect(slug.length).toBeLessThanOrEqual(64)
    expect(slug).toBe('x'.repeat(62) + '-2')
  })

  it('handles maxLength too small for suffix gracefully', () => {
    const slug = generateSlug('ABC', new Set(['abc']), 3)
    // Can't fit a suffix, falls back to base truncated
    expect(slug.length).toBeLessThanOrEqual(3)
  })
})
