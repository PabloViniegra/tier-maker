'use server'

import { getSession } from '@/lib/session'
import { purgeBlobs } from '@/lib/blob'

export async function deleteImagesAction(
  urls: string[]
): Promise<{ ok: true }> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  await purgeBlobs(urls)
  return { ok: true }
}
