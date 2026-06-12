import { z } from 'zod'

export const MIN_ROW_COUNT = 1
export const MAX_ROW_COUNT = 10
export const MIN_ITEM_COUNT = 0
export const MAX_ITEM_COUNT = 30
export const MAX_TITLE_LENGTH = 80
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_CATEGORY_LENGTH = 40
export const MAX_LABEL_LENGTH = 20
export const MAX_IMAGE_LABEL_LENGTH = 50

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

export const imageItemSchema = z.object({
  url: z.string().url(),
  label: z.string().min(1).max(MAX_IMAGE_LABEL_LENGTH),
})

export const tierRowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(MAX_LABEL_LENGTH),
  color: z.string().min(1),
  items: z.array(imageItemSchema).max(MAX_ITEM_COUNT),
})

export const createTierListSchema = z
  .object({
    title: z.string().min(1).max(MAX_TITLE_LENGTH),
    description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
    category: z.string().min(1).max(MAX_CATEGORY_LENGTH),
    coverImageUrl: z.string().url().optional(),
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
    coverImageUrl: z.string().url().optional(),
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
    .max(5 * 1024 * 1024, 'Image must be 5 MB or smaller'),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif'], {
    message: 'Image must be JPG, PNG, WEBP or GIF',
  }),
})

export type ImageUploadInput = z.infer<typeof imageUploadSchema>

export function defaultTierRows(): TierRow[] {
  return (
    Object.entries(TIER_COLORS) as [keyof typeof TIER_COLORS, string][]
  ).map(([label, color]) => ({
    id: `tier-${label.toLowerCase()}`,
    label,
    color,
    items: [],
  }))
}
