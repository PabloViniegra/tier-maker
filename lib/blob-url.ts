export const BLOB_ITEM_PREFIX = 'tier-items'

const BLOB_HOST_RE = /^(.+\.)?public\.blob\.vercel-storage\.com$/

export function blobObjectPath(userId: string, filename: string): string {
  return `${BLOB_ITEM_PREFIX}/${userId}/${filename}`
}

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && BLOB_HOST_RE.test(parsed.hostname)
  } catch {
    return false
  }
}

export function isOwnedBlobUrl(url: string, userId: string): boolean {
  if (!isAllowedImageUrl(url)) return false
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.replace(/^\//, '')
    return path.startsWith(`${BLOB_ITEM_PREFIX}/${userId}/`)
  } catch {
    return false
  }
}

export function assertOwnedBlobUrls(urls: string[], userId: string): void {
  for (const url of urls) {
    if (url.length === 0) continue
    if (!isOwnedBlobUrl(url, userId)) {
      throw new Error('Forbidden')
    }
  }
}
