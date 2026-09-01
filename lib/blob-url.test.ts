import { describe, it, expect } from 'vitest'
import {
  blobObjectPath,
  isAllowedImageUrl,
  isOwnedBlobUrl,
  assertOwnedBlobUrls,
} from './blob-url'

const owned =
  'https://store.public.blob.vercel-storage.com/tier-items/user-1/abc.png'
const otherUser =
  'https://store.public.blob.vercel-storage.com/tier-items/user-2/abc.png'

describe('isAllowedImageUrl', () => {
  it('accepts https vercel blob public hosts', () => {
    expect(isAllowedImageUrl(owned)).toBe(true)
    expect(
      isAllowedImageUrl(
        'https://public.blob.vercel-storage.com/tier-items/user-1/x.png'
      )
    ).toBe(true)
  })

  it('rejects http, non-blob hosts, and non-https schemes', () => {
    expect(isAllowedImageUrl('http://store.public.blob.vercel-storage.com/x')).toBe(
      false
    )
    expect(isAllowedImageUrl('https://evil.example/x.png')).toBe(false)
    expect(isAllowedImageUrl('https://169.254.169.254/latest')).toBe(false)
    expect(isAllowedImageUrl('javascript:alert(1)')).toBe(false)
    expect(isAllowedImageUrl('not-a-url')).toBe(false)
  })
})

describe('isOwnedBlobUrl', () => {
  it('accepts a blob URL under the user prefix', () => {
    expect(isOwnedBlobUrl(owned, 'user-1')).toBe(true)
  })

  it('rejects another user prefix and non-blob URLs', () => {
    expect(isOwnedBlobUrl(otherUser, 'user-1')).toBe(false)
    expect(isOwnedBlobUrl('https://evil.example/x.png', 'user-1')).toBe(false)
  })
})

describe('assertOwnedBlobUrls', () => {
  it('allows owned URLs and skips empty strings', () => {
    expect(() => assertOwnedBlobUrls([owned, ''], 'user-1')).not.toThrow()
  })

  it('throws Forbidden when any URL is not owned', () => {
    expect(() => assertOwnedBlobUrls([owned, otherUser], 'user-1')).toThrow(
      /forbidden/i
    )
  })
})

describe('blobObjectPath', () => {
  it('builds tier-items/{userId}/{filename}', () => {
    expect(blobObjectPath('user-1', 'a.png')).toBe('tier-items/user-1/a.png')
  })
})
