import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { Resend } from 'resend'
import { asMock } from '@/test/as-mock'
import { reportTierList } from './report-tier-list'

const send = new Resend('test').emails.send

const TEMPLATE_ID = '7b0c9a5e-3f2d-4c1b-9a8e-1d2c3b4a5f60'
const input = { templateId: TEMPLATE_ID, reason: 'spam' as const }

function authed(userId = 'user-1') {
  asMock(getSession).mockResolvedValue({ user: { id: userId } })
}

function template(row: { creatorId: string; isPublic: boolean } | null) {
  asMock(db.select).mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi
          .fn()
          .mockResolvedValue(row ? [{ ...row, title: 'Best', slug: 'best' }] : []),
      }),
    }),
  })
}

function insertReturns(rows: { id: string }[]) {
  const values = vi.fn().mockReturnValue({
    onConflictDoNothing: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(rows),
    }),
  })
  asMock(db.insert).mockReturnValue({ values })
  return values
}

describe('reportTierList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('REPORTS_EMAIL', 'mod@example.com')
    asMock(send).mockReset()
    asMock(send).mockResolvedValue({ data: { id: 'email-id' }, error: null })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('requires an authenticated session', async () => {
    asMock(getSession).mockResolvedValue(null)
    await expect(reportTierList(input)).rejects.toThrow(/auth/i)
  })

  it('rejects an unknown reason', async () => {
    authed()
    // Server action arguments arrive as untyped wire data.
    const tampered = JSON.parse(JSON.stringify({ ...input, reason: 'boring' }))
    await expect(reportTierList(tampered)).rejects.toThrow(/invalid/i)
  })

  it.each([
    ['missing', null],
    ['private', { creatorId: 'user-2', isPublic: false }],
  ])('rejects a %s tier list', async (_name, row) => {
    authed()
    template(row)
    await expect(reportTierList(input)).rejects.toThrow(/not found/i)
  })

  it('rejects reporting your own tier list', async () => {
    authed('user-1')
    template({ creatorId: 'user-1', isPublic: true })
    await expect(reportTierList(input)).rejects.toThrow(/own/i)
  })

  it('stores the report and notifies moderation', async () => {
    authed('user-1')
    template({ creatorId: 'user-2', isPublic: true })
    const values = insertReturns([{ id: 'report-1' }])

    const result = await reportTierList({ ...input, details: '  bot  ' })

    expect(result).toEqual({ status: 'reported' })
    expect(values).toHaveBeenCalledWith({
      templateId: TEMPLATE_ID,
      reporterId: 'user-1',
      reason: 'spam',
      details: 'bot',
    })
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'mod@example.com',
        html: expect.stringContaining('/explore/best'),
      }),
      { idempotencyKey: 'content-report/report-1' }
    )
  })

  it('does not notify again when the user already reported it', async () => {
    authed('user-1')
    template({ creatorId: 'user-2', isPublic: true })
    insertReturns([])

    expect(await reportTierList(input)).toEqual({ status: 'already-reported' })
    expect(send).not.toHaveBeenCalled()
  })

  it('keeps the report when the notification email fails', async () => {
    authed('user-1')
    template({ creatorId: 'user-2', isPublic: true })
    insertReturns([{ id: 'report-1' }])
    asMock(send).mockResolvedValue({ data: null, error: { message: 'down' } })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(await reportTierList(input)).toEqual({ status: 'reported' })
  })
})
