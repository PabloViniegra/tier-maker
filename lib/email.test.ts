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
      url: 'https://tier-maker.app/verify',
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

    const payload = mockSend.mock.calls[0][0]
    expect(payload.html).toContain('TIER MAKER')
    expect(payload.html).toContain('ACCOUNT VERIFICATION')
    expect(payload.html).toContain('role="presentation"')
    expect(payload.html).toContain('href="https://tier-maker.app/verify"')
    expect(
      payload.html.match(/href="https:\/\/tier-maker\.app\/verify"/g)
    ).toHaveLength(2)
    expect(payload.html).toContain('width:100%')
    expect(payload.text).toContain('SECURE LINK')
    expect(payload.text).toContain('https://tier-maker.app/verify')
    expect(payload.text).not.toContain('\u00a0')
  })

  it('sends password reset with separate idempotency', async () => {
    await sendPasswordResetEmail({
      to: 'user@example.com',
      url: 'https://tier-maker.app/reset',
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

    const payload = mockSend.mock.calls[0][0]
    expect(payload.html).toContain('PASSWORD RESET')
    expect(payload.html).toContain('Reset your password')
    expect(
      payload.html.match(/href="https:\/\/tier-maker\.app\/reset"/g)
    ).toHaveLength(2)
    expect(payload.text).toContain('This private link will expire.')
    expect(payload.text).toContain('https://tier-maker.app/reset')
    expect(payload.text).not.toContain('\u00a0')
  })

  it('propagates provider errors', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Rejected sender' },
    })

    await expect(
      sendVerificationEmail({
        to: 'user@example.com',
        url: 'https://tier-maker.app/verify',
        token: 'verification-token',
      })
    ).rejects.toThrow('Resend failed: Rejected sender')
  })

  it('rejects authentication links outside the application origin', async () => {
    await expect(
      sendVerificationEmail({
        to: 'user@example.com',
        url: 'https://attacker.example/verify',
        token: 'verification-token',
      })
    ).rejects.toThrow('Invalid authentication email URL')

    expect(mockSend).not.toHaveBeenCalled()
  })
})
