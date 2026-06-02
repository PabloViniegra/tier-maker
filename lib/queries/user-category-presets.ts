import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userCategoryPresets } from '@/lib/db/schema'

export type UserCategoryPreset = { id: string; name: string }

export async function getUserCategoryPresets(userId: string): Promise<UserCategoryPreset[]> {
  return db
    .select({ id: userCategoryPresets.id, name: userCategoryPresets.name })
    .from(userCategoryPresets)
    .where(eq(userCategoryPresets.userId, userId))
    .orderBy(desc(userCategoryPresets.createdAt))
}
