import 'server-only'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { account } from '@/lib/db/schema'

export async function getUserProviderIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ providerId: account.providerId })
    .from(account)
    .where(eq(account.userId, userId))

  return rows.map((row) => row.providerId)
}
