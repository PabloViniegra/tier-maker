import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { betterAuth } from 'better-auth'
import { waitUntil } from '@vercel/functions'
import * as email from './email'
import { asMock } from '@/test/as-mock'

describe('auth — module shape', () => {
  let auth: (typeof import('./auth'))['auth']

  beforeAll(async () => {
    vi.spyOn(email, 'sendVerificationEmail').mockResolvedValue(undefined)
    vi.spyOn(email, 'sendPasswordResetEmail').mockResolvedValue(undefined)
    const mod = await import('./auth')
    auth = mod.auth
  })

  beforeEach(() => {
    asMock(waitUntil).mockClear()
    asMock(email.sendVerificationEmail).mockClear()
    asMock(email.sendPasswordResetEmail).mockClear()
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
