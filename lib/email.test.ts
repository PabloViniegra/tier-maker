import { beforeEach, describe, expect, it } from 'vitest'
import { Resend } from 'resend'
import { sendPasswordResetEmail, sendVerificationEmail } from './email'
import { asMock } from '@/test/as-mock'

const send = new Resend('test').emails.send

describe('authentication email delivery', () => {
  beforeEach(() => {
    asMock(send).mockReset()
    asMock(send).mockResolvedValue({ data: { id: 'email-id' }, error: null })
  })

  it('sends verification from the authorized domain with idempotency', async () => {
    await sendVerificationEmail({
      to: 'user@example.com',
      url: 'https://tiermaker.pabloviniegra.dev/verify',
      token: 'verification-token',
    })

    expect(send).toHaveBeenCalledWith(
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

    const payload = asMock(send).mock.calls[0][0]
    expect(payload.html).toContain('TIER MAKER')
    expect(payload.html).toContain('ACCOUNT VERIFICATION')
    expect(payload.html).toContain('role="presentation"')
    expect(payload.html).toContain('href="https://tiermaker.pabloviniegra.dev/verify"')
    expect(
      payload.html.match(/href="https:\/\/tiermaker\.pabloviniegra\.dev\/verify"/g)
    ).toHaveLength(2)
    expect(payload.html).toContain('width:100%')
    expect(payload.text).toContain('SECURE LINK')
    expect(payload.text).toContain('https://tiermaker.pabloviniegra.dev/verify')
    expect(payload.text).not.toContain('\u00a0')
  })

  it('sends password reset with separate idempotency', async () => {
    await sendPasswordResetEmail({
      to: 'user@example.com',
      url: 'https://tiermaker.pabloviniegra.dev/reset',
      token: 'reset-token',
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Tier Maker <auth@send.pabloviniegra.dev>',
        subject: 'Reset your Tier Maker password',
      }),
      {
        idempotencyKey: expect.stringMatching(/^password-reset\/[a-f0-9]{64}$/),
      }
    )

    const payload = asMock(send).mock.calls[0][0]
    expect(payload.html).toContain('PASSWORD RESET')
    expect(payload.html).toContain('Reset your password')
    expect(
      payload.html.match(/href="https:\/\/tiermaker\.pabloviniegra\.dev\/reset"/g)
    ).toHaveLength(2)
    expect(payload.text).toContain('This private link will expire.')
    expect(payload.text).toContain('https://tiermaker.pabloviniegra.dev/reset')
    expect(payload.text).not.toContain('\u00a0')
  })

  it('propagates provider errors', async () => {
    asMock(send).mockResolvedValue({
      data: null,
      error: { message: 'Rejected sender' },
    })

    await expect(
      sendVerificationEmail({
        to: 'user@example.com',
        url: 'https://tiermaker.pabloviniegra.dev/verify',
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

    expect(send).not.toHaveBeenCalled()
  })
})
