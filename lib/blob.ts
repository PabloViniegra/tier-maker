import 'server-only'
import { del } from '@vercel/blob'

export async function purgeBlobs(urls: string[]): Promise<void> {
  const valid = urls.filter((u) => typeof u === 'string' && u.length > 0)
  if (valid.length === 0) return
  await del(valid)
}
