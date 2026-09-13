import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { betterAuth } from 'better-auth'
import { waitUntil } from '@vercel/functions'
import * as email from './email'
import { asMock } from '@/test/as-mock'

type EmailOtpOptions = {
  disableSignUp?: boolean
  storeOTP?: string
  sendVerificationOTP?: (payload: {
    email: string
    otp: string
    type: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email'
  }) => Promise<void>
}

// The plugin factory is the only seam Better Auth exposes for this callback.
// eslint-disable-next-line anti-slop/no-module-mocking -- Capture plugin options without loading Better Auth's endpoint implementation.
vi.mock('better-auth/plugins/email-otp', () => ({
  emailOTP: vi.fn((options: EmailOtpOptions) => ({
    id: 'email-otp',
    options,
  })),
}))

describe('auth — module shape', () => {
  let auth: (typeof import('./auth'))['auth']

  beforeAll(async () => {
    vi.spyOn(email, 'sendVerificationEmail').mockResolvedValue(undefined)
    vi.spyOn(email, 'sendPasswordResetEmail').mockResolvedValue(undefined)
    vi.spyOn(email, 'sendVerificationOtpEmail').mockResolvedValue(undefined)
    const mod = await import('./auth')
    auth = mod.auth
  })

  beforeEach(() => {
    asMock(waitUntil).mockClear()
    asMock(email.sendVerificationEmail).mockClear()
    asMock(email.sendPasswordResetEmail).mockClear()
    asMock(email.sendVerificationOtpEmail).mockClear()
  })

  it('exports an auth instance', () => {
    expect(auth).toBeDefined()
  })

  it('auth has a handler function', () => {
    expect(auth.handler).toEqual(expect.any(Function))
  })

  it('auth has an api object', () => {
    expect(auth.api).toBeDefined()
  })

  it('betterAuth was called with emailAndPassword enabled', () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    expect(config.emailVerification?.autoSignInAfterVerification).toBe(true)
    expect(config.emailAndPassword?.enabled).toBe(true)
    expect(config.emailAndPassword?.requireEmailVerification).toBe(true)
    expect(config.emailAndPassword?.sendResetPassword).toEqual(
      expect.any(Function)
    )
  })

  it('configures verification emails for sign-up and sign-in', () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    expect(config.emailVerification?.sendOnSignUp).toBe(true)
    expect(config.emailVerification?.sendOnSignIn).toBe(true)
    expect(config.emailVerification?.sendVerificationEmail).toEqual(
      expect.any(Function)
    )
  })

  it('schedules verification email delivery with Vercel', async () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    const sendVerificationEmail = config.emailVerification?.sendVerificationEmail
    expect(sendVerificationEmail).toEqual(expect.any(Function))
    if (!sendVerificationEmail) return

    await sendVerificationEmail({
      user: { email: 'user@example.com' },
      url: 'https://example.com/verify',
      token: 'verification-token',
    })

    expect(email.sendVerificationEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      url: 'https://example.com/verify',
      token: 'verification-token',
    })
    expect(waitUntil).toHaveBeenCalledOnce()
  })

  it('schedules password reset email delivery with Vercel', async () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    const sendResetPassword = config.emailAndPassword?.sendResetPassword
    expect(sendResetPassword).toEqual(expect.any(Function))
    if (!sendResetPassword) return

    await sendResetPassword({
      user: { email: 'user@example.com' },
      url: 'https://example.com/reset',
      token: 'reset-token',
    })

    expect(email.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      url: 'https://example.com/reset',
      token: 'reset-token',
    })
    expect(waitUntil).toHaveBeenCalled()
  })

  it('stores rate limits in the database for serverless deployments', () => {
    const config = asMock(betterAuth).mock.calls[0][0]

    expect(config.rateLimit?.storage).toBe('database')
    expect(config.rateLimit?.customRules?.['/request-password-reset']).toEqual({
      window: 3600,
      max: 5,
    })
    expect(
      config.rateLimit?.customRules?.['/email-otp/send-verification-otp']
    ).toEqual({
      window: 3600,
      max: 5,
    })
    expect(config.rateLimit?.customRules?.['/sign-in/email-otp']).toEqual({
      window: 3600,
      max: 5,
    })
  })

  it('enables email OTP without overriding link verification', () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    expect(config.plugins?.[0]).toEqual(
      expect.objectContaining({ id: 'email-otp' })
    )
    expect(config.emailVerification?.sendOnSignUp).toBe(true)
    expect(config.emailVerification?.sendOnSignIn).toBe(true)
  })

  it('disables email OTP sign-up and hashes stored codes', () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    const options = config.plugins?.[0]?.options

    expect(options?.disableSignUp).toBe(true)
    expect(options?.storeOTP).toBe('hashed')
  })

  it('only schedules OTP email delivery for email verification', async () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    const sendVerificationOTP = config.plugins?.[0]?.options?.sendVerificationOTP
    expect(sendVerificationOTP).toEqual(expect.any(Function))
    if (!sendVerificationOTP) return

    await sendVerificationOTP({
      email: 'user@example.com',
      otp: '123456',
      type: 'sign-in',
    })
    await sendVerificationOTP({
      email: 'user@example.com',
      otp: '123456',
      type: 'forget-password',
    })

    expect(email.sendVerificationOtpEmail).not.toHaveBeenCalled()
    expect(waitUntil).not.toHaveBeenCalled()

    await sendVerificationOTP({
      email: 'user@example.com',
      otp: '123456',
      type: 'email-verification',
    })

    expect(email.sendVerificationOtpEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      otp: '123456',
    })
    expect(waitUntil).toHaveBeenCalledOnce()
  })

  it('enables authenticated account deletion', () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    expect(config.user?.deleteUser?.enabled).toBe(true)
  })

  it('betterAuth was called with a database adapter', () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    expect(config.database).toBeDefined()
  })

  it('betterAuth was called with Google social provider configured', () => {
    const config = asMock(betterAuth).mock.calls[0][0]
    const google = config.socialProviders?.google
    expect(google).toBeDefined()
    expect(google && 'clientId' in google ? google.clientId : undefined).toBeDefined()
    expect(
      google && 'clientSecret' in google ? google.clientSecret : undefined
    ).toBeDefined()
  })
})
