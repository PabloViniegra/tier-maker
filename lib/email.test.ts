import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

import { sendPasswordResetEmail, sendVerificationEmail } from './email'

describe('authentication email delivery', () => {
  beforeEach(() => {
    mockSend.mockReset()
    mockSend.mockResolvedValue({ data: { id: 'email-id' }, error: null })
  })

  it('sends verification from the authorized domain with idempotency', async () => {
    await sendVerificationEmail({
      to: 'user@example.com',
      url: 'https://example.com/verify',
      token: 'verification-token',
    })

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Tier Maker <auth@send.pabloviniegra.dev>',
        to: 'user@example.com',
        subject: 'Verify your Tier Maker email',
        html: expect.stringContaining('Verify your email'),
        text: expect.stringMatching(/verify your email/i),
      }),
      {
        idempotencyKey: expect.stringMatching(
          /^email-verification\/[a-f0-9]{64}$/
        ),
      }
    )
  })

  it('sends password reset with separate idempotency', async () => {
    await sendPasswordResetEmail({
      to: 'user@example.com',
      url: 'https://example.com/reset',
      token: 'reset-token',
    })

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Tier Maker <auth@send.pabloviniegra.dev>',
        subject: 'Reset your Tier Maker password',
      }),
      {
        idempotencyKey: expect.stringMatching(/^password-reset\/[a-f0-9]{64}$/),
      }
    )
  })

  it('propagates provider errors', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Rejected sender' },
    })

    await expect(
      sendVerificationEmail({
        to: 'user@example.com',
        url: 'https://example.com/verify',
        token: 'verification-token',
      })
    ).rejects.toThrow('Resend failed: Rejected sender')
  })
})
