import { unlink } from 'node:fs/promises'
import { clearE2EData, loadEnvironment, withDatabase } from './database'

export default async function globalTeardown() {
  try {
    loadEnvironment()
    await withDatabase(clearE2EData)
  } finally {
    await unlink('playwright/.auth/user.json').catch(() => undefined)
  }
}
