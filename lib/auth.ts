import 'server-only'
import { waitUntil } from '@vercel/functions'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as schema from './db/schema'
import { sendPasswordResetEmail, sendVerificationEmail } from './email'

function reportEmailError() {
  console.error('Authentication email failed')
}

function requiredEnv(name: 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET'): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }) => {
      waitUntil(
        sendPasswordResetEmail({ to: user.email, url, token }).catch(
          reportEmailError
        )
      )
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      waitUntil(
        sendVerificationEmail({ to: user.email, url, token }).catch(
          reportEmailError
        )
      )
    },
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 3600, max: 5 },
      '/request-password-reset': { window: 3600, max: 5 },
      '/send-verification-email': { window: 3600, max: 5 },
    },
  },
  socialProviders: {
    google: {
      clientId: requiredEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://tier-maker.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
})
