'use server'

import { getSession } from '@/lib/session'
import { purgeBlobs } from '@/lib/blob'
import { assertOwnedBlobUrls } from '@/lib/blob-url'

export async function deleteImagesAction(
  urls: string[]
): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  assertOwnedBlobUrls(urls, session.user.id)
  await purgeBlobs(urls)
  return { ok: true }
}
