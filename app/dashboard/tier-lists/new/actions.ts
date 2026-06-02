'use server'

import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierRows, tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import {
  createTierListSchema,
  imageUploadSchema,
  type CreateTierListInput,
} from '@/lib/validators/tier-list'

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

  const [tpl] = await db
    .insert(tierTemplates)
    .values({
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      creatorId: session.user.id,
      sidebarItems,
    })
    .returning({ id: tierTemplates.id })

  try {
    if (data.rows.length > 0) {
      await db.insert(tierRows).values(
        data.rows.map((row, index) => ({
          templateId: tpl.id,
          label: row.label,
          color: row.color,
          order: index,
        }))
      )
    }
  } catch {
    await db.delete(tierTemplates).where(eq(tierTemplates.id, tpl.id))
    throw new Error('Could not save tier rows')
  }

  revalidatePath('/dashboard')
  return { id: tpl.id }
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
  ]
}
