import { unlink } from 'node:fs/promises'
import { clearE2EData, withDatabase } from './database'

export default async function globalTeardown() {
  try {
    await withDatabase(clearE2EData)
  } finally {
    await unlink('playwright/.auth/user.json').catch(() => undefined)
  }
}
