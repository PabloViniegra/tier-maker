'use server'

import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates, userCategoryPresets } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import {
  createTierListSchema,
  imageUploadSchema,
  MAX_CATEGORY_LENGTH,
  type CreateTierListInput,
} from '@/lib/validators/tier-list'
import type { UserCategoryPreset } from '@/lib/queries/user-category-presets'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function extFromMime(type: string): string {
  return EXT_BY_MIME[type] ?? 'bin'
}

function uniquePath(userId: string, type: string): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12)
  return `tier-items/${userId}/${uuid}.${extFromMime(type)}`
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

  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('Image must be JPG, PNG, WEBP or GIF')
  }

  try {
    const blob = await put(uniquePath(session.user.id, file.type), file, {
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
  const sidebarItems = [
    ...data.bankItems,
    ...data.rows.flatMap((r) => r.items),
  ]

  const { id } = await db.transaction(async (tx) => {
    const [tpl] = await tx
      .insert(tierTemplates)
      .values({
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        creatorId: session.user.id,
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
        }))
      )
    }

    return tpl
  })

  revalidatePath('/dashboard')
  return { id }
}

export async function getCategoryPresets(): Promise<string[]> {
  return [
    'Videojuegos',
    'Cine',
    'Música',
    'Anime',
    'TV',
    'Deportes',
    'Comida',
    'Libros',
    'Tecnología',
    'Política',
    'Moda',
    'Arte',
    'Ciencia',
    'Naturaleza',
    'Historia',
  ]
}

export async function saveUserCategoryPresetAction(
  name: string
): Promise<UserCategoryPreset | null> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')

  const trimmed = name.trim()
  if (!trimmed || trimmed.length > MAX_CATEGORY_LENGTH) {
    throw new Error(`Category name must be between 1 and ${MAX_CATEGORY_LENGTH} characters`)
  }

  const [row] = await db
    .insert(userCategoryPresets)
    .values({ userId: session.user.id, name: trimmed })
    .onConflictDoNothing()
    .returning({ id: userCategoryPresets.id, name: userCategoryPresets.name })

  return row ?? null
}

export async function deleteUserCategoryPresetAction(id: string): Promise<void> {
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
