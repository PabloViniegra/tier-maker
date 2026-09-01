'use server'

import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates, userCategoryPresets } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { blobObjectPath } from '@/lib/blob-url'
import { revalidateExplore } from '@/lib/revalidate-explore'
import {
  buildCatalogue,
  createTierListSchema,
  imageUploadSchema,
  IMAGE_EXT_BY_MIME,
  MAX_CATEGORY_LENGTH,
  type AllowedImageType,
  type CreateTierListInput,
} from '@/lib/validators/tier-list'
import type { UserCategoryPreset } from '@/lib/queries/user-category-presets'
import { slugify } from '@/lib/utils/slug'

const MAX_SLUG_RETRIES = 50

function isUniqueViolation(err: Error): boolean {
  return 'code' in err && err.code === '23505'
}

function uniquePath(userId: string, type: AllowedImageType): string {
  return blobObjectPath(userId, `${crypto.randomUUID()}.${IMAGE_EXT_BY_MIME[type]}`)
}

export type UploadImagesResult = { url: string }

export async function uploadImagesAction(
  formData: FormData
): Promise<UploadImagesResult> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthenticated')
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    throw new Error('No file provided')
  }

  const parsed = imageUploadSchema.safeParse({
    size: file.size,
    type: file.type,
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid image')
  }

  try {
    const blob = await put(uniquePath(session.user.id, parsed.data.type), file, {
      access: 'public',
    })
    return { url: blob.url }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    throw new Error(`Image upload failed: ${message}`)
  }
}

export type CreateTierListResult = { id: string }

export async function createTierListAction(
  input: CreateTierListInput
): Promise<CreateTierListResult> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthenticated')
  }

  const parsed = createTierListSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const data = parsed.data
  const sidebarItems = buildCatalogue(data.bankItems, data.rows)

  // Slug uniqueness is enforced by the DB (unique constraint on tierTemplates.slug).
  // Try the base slug first, then append -2, -3, ... on conflict (PG 23505).
  const baseSlug = slugify(data.title) || slugify('untitled')

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    const slug =
      attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`

    try {
      const { id } = await db.transaction(async (tx) => {
        const [tpl] = await tx
          .insert(tierTemplates)
          .values({
            title: data.title,
            slug,
            description: data.description ?? null,
            category: data.category,
            creatorId: session.user.id,
            coverImageUrl: data.coverImageUrl ?? null,
            sidebarItems,
          })
          .returning({ id: tierTemplates.id })

        if (data.rows.length > 0) {
          await tx.insert(tierRows).values(
            data.rows.map((row, index) => ({
              templateId: tpl.id,
              label: row.label,
              color: row.color,
              order: index,
              items: row.items,
            }))
          )
        }

        return tpl
      })

      revalidatePath('/dashboard')
      revalidateExplore()
      return { id }
    } catch (err) {
      if (
        err instanceof Error &&
        isUniqueViolation(err) &&
        attempt < MAX_SLUG_RETRIES - 1
      ) {
        continue
      }
      throw err
    }
  }

  throw new Error('Could not generate a unique slug')
}

export async function saveUserCategoryPresetAction(
  name: string
): Promise<UserCategoryPreset | null> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const trimmed = name.trim()
  if (!trimmed || trimmed.length > MAX_CATEGORY_LENGTH) {
    throw new Error(
      `Category name must be between 1 and ${MAX_CATEGORY_LENGTH} characters`
    )
  }

  const [row] = await db
    .insert(userCategoryPresets)
    .values({ userId: session.user.id, name: trimmed })
    .onConflictDoNothing()
    .returning({ id: userCategoryPresets.id, name: userCategoryPresets.name })

  return row ?? null
}

export async function deleteUserCategoryPresetAction(
  id: string
): Promise<void> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  await db
    .delete(userCategoryPresets)
    .where(
      and(
        eq(userCategoryPresets.id, id),
        eq(userCategoryPresets.userId, session.user.id)
      )
    )
}
