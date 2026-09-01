import { z } from 'zod'
import { isAllowedImageUrl } from '@/lib/blob-url'

export const MIN_ROW_COUNT = 1
export const MAX_ROW_COUNT = 10
export const MIN_ITEM_COUNT = 0
export const MAX_ITEM_COUNT = 30
export const MAX_TITLE_LENGTH = 80
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_CATEGORY_LENGTH = 40
export const MAX_LABEL_LENGTH = 20
export const MAX_IMAGE_LABEL_LENGTH = 50

export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

export const IMAGE_EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const satisfies Record<AllowedImageType, string>

export const TIER_COLORS = {
  S: 'oklch(0.65 0.22 250)',
  A: 'oklch(0.65 0.20 145)',
  B: 'oklch(0.68 0.18 75)',
  C: 'oklch(0.65 0.20 45)',
  D: 'oklch(0.62 0.18 15)',
  F: 'oklch(0.58 0.10 280)',
} as const

export type TierRow = {
  id: string
  label: string
  color: string
  items: ImageItem[]
}

export type ImageItem = {
  url: string
  label: string
}

const imageUrlSchema = z.url({
  protocol: /^https$/,
  hostname: /^(.+\.)?public\.blob\.vercel-storage\.com$/,
})

const UNSAFE_COLOR = /url\s*\(|expression\s*\(|javascript:/i
const SAFE_COLOR =
  /^(#([0-9a-fA-F]{3,8})|oklch\(|oklab\(|lab\(|lch\(|rgb\(|rgba\(|hsl\(|hsla\(|color\()/

export const tierColorSchema = z
  .string()
  .min(1)
  .refine((value) => {
    const trimmed = value.trim()
    return SAFE_COLOR.test(trimmed) && !UNSAFE_COLOR.test(trimmed)
  }, 'Invalid color')

export const imageItemSchema = z.object({
  url: imageUrlSchema.refine(isAllowedImageUrl),
  label: z.string().min(1).max(MAX_IMAGE_LABEL_LENGTH),
})

export const tierRowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(MAX_LABEL_LENGTH),
  color: tierColorSchema,
  items: z.array(imageItemSchema).max(MAX_ITEM_COUNT),
})

export const createTierListSchema = z
  .object({
    title: z.string().min(1).max(MAX_TITLE_LENGTH),
    description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
    category: z.string().min(1).max(MAX_CATEGORY_LENGTH),
    coverImageUrl: imageUrlSchema.optional(),
    rows: z.array(tierRowSchema).min(MIN_ROW_COUNT).max(MAX_ROW_COUNT),
    bankItems: z.array(imageItemSchema).max(MAX_ITEM_COUNT),
  })
  .refine(
    (val) => {
      const total =
        val.bankItems.length +
        val.rows.reduce((sum, r) => sum + r.items.length, 0)
      return total <= MAX_ITEM_COUNT
    },
    { message: `Total items must be <= ${MAX_ITEM_COUNT}` }
  )

export type CreateTierListInput = z.infer<typeof createTierListSchema>

export const updateTierListPayloadSchema = z
  .object({
    coverImageUrl: imageUrlSchema.optional(),
    bankItems: z.array(imageItemSchema).max(MAX_ITEM_COUNT),
    rows: z.array(tierRowSchema).max(MAX_ROW_COUNT),
  })
  .refine(
    (val) => {
      const total =
        val.bankItems.length +
        val.rows.reduce((sum, r) => sum + r.items.length, 0)
      return total <= MAX_ITEM_COUNT
    },
    { message: `Total items must be <= ${MAX_ITEM_COUNT}` }
  )

export const imageUploadSchema = z.object({
  size: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_FILE_SIZE, 'Image must be 5 MB or smaller'),
  type: z.enum(ALLOWED_IMAGE_TYPES, {
    message: 'Image must be JPG, PNG, WEBP or GIF',
  }),
})

export type ImageUploadInput = z.infer<typeof imageUploadSchema>

export function buildCatalogue(
  bankItems: ImageItem[],
  rows: { items: ImageItem[] }[]
): ImageItem[] {
  const seen = new Set<string>()
  const catalogue: ImageItem[] = []
  for (const item of [...bankItems, ...rows.flatMap((r) => r.items)]) {
    if (seen.has(item.url)) continue
    seen.add(item.url)
    catalogue.push(item)
  }
  return catalogue
}

const TIER_ORDER = ['S', 'A', 'B', 'C', 'D', 'F'] as const

export function defaultTierRows(): TierRow[] {
  return TIER_ORDER.map((label) => ({
    id: `tier-${label.toLowerCase()}`,
    label,
    color: TIER_COLORS[label],
    items: [],
  }))
}
