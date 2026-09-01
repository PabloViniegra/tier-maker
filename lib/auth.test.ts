import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockWaitUntil, mockSendVerificationEmail, mockSendPasswordResetEmail } =
  vi.hoisted(() => ({
    mockWaitUntil: vi.fn(),
    mockSendVerificationEmail: vi.fn(() => Promise.resolve()),
    mockSendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  }))

vi.mock('./db', () => ({ db: {} }))

vi.mock('better-auth', () => ({
  betterAuth: vi.fn((config: Record<string, unknown>) => ({
    handler: vi.fn(),
    api: {},
    _config: config,
  })),
}))

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: vi.fn(() => ({ type: 'drizzle' })),
}))

vi.mock('@vercel/functions', () => ({ waitUntil: mockWaitUntil }))

vi.mock('./email', () => ({
  sendVerificationEmail: mockSendVerificationEmail,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}))

describe('auth — module shape', () => {
  let auth: (typeof import('./auth'))['auth']
  let betterAuthMock: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    const mod = await import('./auth')
    auth = mod.auth
    const { betterAuth } = await import('better-auth')
    betterAuthMock = betterAuth as ReturnType<typeof vi.fn>
  })

  beforeEach(() => {
    mockWaitUntil.mockClear()
    mockSendVerificationEmail.mockClear()
    mockSendPasswordResetEmail.mockClear()
  })

  it('exports an auth instance', () => {
    expect(auth).toBeDefined()
  })

  it('auth has a handler function', () => {
    expect(typeof auth.handler).toBe('function')
  })

  it('auth has an api object', () => {
    expect(auth.api).toBeDefined()
  })

  it('betterAuth was called with emailAndPassword enabled', () => {
    const config = betterAuthMock.mock.calls[0][0]
    expect(config.emailVerification?.autoSignInAfterVerification).toBe(true)
    expect(config.emailAndPassword?.enabled).toBe(true)
    expect(config.emailAndPassword?.requireEmailVerification).toBe(true)
    expect(config.emailAndPassword?.sendResetPassword).toBeTypeOf('function')
  })

  it('configures verification emails for sign-up and sign-in', () => {
    const config = betterAuthMock.mock.calls[0][0]
    expect(config.emailVerification?.sendOnSignUp).toBe(true)
    expect(config.emailVerification?.sendOnSignIn).toBe(true)
    expect(config.emailVerification?.sendVerificationEmail).toBeTypeOf(
      'function'
    )
  })

  it('schedules verification email delivery with Vercel', async () => {
    const config = betterAuthMock.mock.calls[0][0]

    await config.emailVerification.sendVerificationEmail({
      user: { email: 'user@example.com' },
      url: 'https://example.com/verify',
      token: 'verification-token',
    })

    expect(mockSendVerificationEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      url: 'https://example.com/verify',
      token: 'verification-token',
    })
    expect(mockWaitUntil).toHaveBeenCalledOnce()
  })

  it('schedules password reset email delivery with Vercel', async () => {
    const config = betterAuthMock.mock.calls[0][0]

    await config.emailAndPassword.sendResetPassword({
      user: { email: 'user@example.com' },
      url: 'https://example.com/reset',
      token: 'reset-token',
    })

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      url: 'https://example.com/reset',
      token: 'reset-token',
    })
    expect(mockWaitUntil).toHaveBeenCalled()
  })

  it('stores rate limits in the database for serverless deployments', () => {
    const config = betterAuthMock.mock.calls[0][0]

    expect(config.rateLimit?.storage).toBe('database')
    expect(config.rateLimit?.customRules['/request-password-reset']).toEqual({
      window: 3600,
      max: 5,
    })
  })

  it('betterAuth was called with a database adapter', () => {
    const config = betterAuthMock.mock.calls[0][0]
    expect(config.database).toBeDefined()
  })

  it('betterAuth was called with Google social provider configured', () => {
    const config = betterAuthMock.mock.calls[0][0]
    expect(config.socialProviders?.google).toBeDefined()
    expect(config.socialProviders?.google?.clientId).toBeDefined()
    expect(config.socialProviders?.google?.clientSecret).toBeDefined()
  })
})
