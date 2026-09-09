import { vi } from 'vitest'

export type AuthEmailPayload = {
  user: { email: string }
  url: string
  token: string
}

export type BetterAuthTestConfig = {
  emailAndPassword?: {
    enabled?: boolean
    requireEmailVerification?: boolean
    sendResetPassword?: (payload: AuthEmailPayload) => void
  }
  emailVerification?: {
    autoSignInAfterVerification?: boolean
    sendOnSignUp?: boolean
    sendOnSignIn?: boolean
    sendVerificationEmail?: (payload: AuthEmailPayload) => void
  }
  rateLimit?: {
    storage?: string
    customRules?: {
      '/request-password-reset'?: { window: number; max: number }
      '/email-otp/send-verification-otp'?: { window: number; max: number }
    }
  }
  plugins?: Array<{ id?: string }>
  user?: {
    deleteUser?: { enabled?: boolean }
  }
  database?: { type: string }
  socialProviders?: {
    google?: { clientId?: string; clientSecret?: string }
  }
}

export const betterAuth = vi.fn((config: BetterAuthTestConfig) => ({
  handler: vi.fn(),
  api: {},
  _config: config,
}))
