import { z } from 'zod'

export const REPORT_REASONS = [
  'spam',
  'sexual',
  'violence',
  'hate',
  'copyright',
  'other',
] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

export const MAX_REPORT_DETAILS_LENGTH = 500

export const reportTierListSchema = z.object({
  templateId: z.uuid(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(MAX_REPORT_DETAILS_LENGTH).optional(),
})

export type ReportTierListInput = z.infer<typeof reportTierListSchema>
