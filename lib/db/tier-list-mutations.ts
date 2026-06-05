import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates } from '@/lib/db/schema'
import type { ImageItem } from '@/lib/validators/tier-list'

export type TierRowInput = {
  id: string
  label: string
  color: string
  items: ImageItem[]
}

type TxLike = Pick<typeof db, 'delete' | 'insert'>

export async function assertOwned(id: string, userId: string): Promise<void> {
  const [owned] = await db
    .select({ id: tierTemplates.id })
    .from(tierTemplates)
    .where(and(eq(tierTemplates.id, id), eq(tierTemplates.creatorId, userId)))
  if (!owned) throw new Error('Not found')
}

export async function replaceTierRows(
  tx: TxLike,
  templateId: string,
  rows: TierRowInput[]
): Promise<void> {
  await tx.delete(tierRows).where(eq(tierRows.templateId, templateId))
  if (rows.length > 0) {
    await tx.insert(tierRows).values(
      rows.map((row, index) => ({
        id: row.id,
        templateId,
        label: row.label,
        color: row.color,
        order: index,
        items: row.items,
      }))
    )
  }
}
