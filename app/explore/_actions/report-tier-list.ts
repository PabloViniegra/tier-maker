'use server'

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tierReports, tierTemplates } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { sendReportNotificationEmail } from '@/lib/email'
import {
  reportTierListSchema,
  type ReportTierListInput,
} from '@/lib/validators/report'

export async function reportTierList(
  input: ReportTierListInput
): Promise<{ status: 'reported' | 'already-reported' }> {
  const session = await getSession()
  if (!session) throw new Error('Authentication required')

  const parsed = reportTierListSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid report')
  const { templateId, reason, details } = parsed.data

  const [template] = await db
    .select({
      creatorId: tierTemplates.creatorId,
      isPublic: tierTemplates.isPublic,
      title: tierTemplates.title,
      slug: tierTemplates.slug,
    })
    .from(tierTemplates)
    .where(eq(tierTemplates.id, templateId))
    .limit(1)

  if (!template?.isPublic) throw new Error('Tier list not found')
  if (template.creatorId === session.user.id)
    throw new Error('Cannot report your own tier list')

  const [report] = await db
    .insert(tierReports)
    .values({
      templateId,
      reporterId: session.user.id,
      reason,
      details: details || null,
    })
    .onConflictDoNothing()
    .returning({ id: tierReports.id })

  if (!report) return { status: 'already-reported' }

  const to = process.env.REPORTS_EMAIL
  if (to) {
    // The report is already stored, so a mail outage must not fail the request.
    await sendReportNotificationEmail({
      to,
      reportId: report.id,
      reason,
      details: details || null,
      tierListTitle: template.title,
      tierListSlug: template.slug,
    }).catch((err) => console.error('Report notification failed', err))
  }

  return { status: 'reported' }
}
