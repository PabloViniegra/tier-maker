import type { Metadata } from 'next'
import Link from 'next/link'

import { RequestPasswordResetForm } from '@/components/password-reset-form'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link for your Tier Maker account.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          We will email you a secure reset link
        </p>
      </div>
      <RequestPasswordResetForm />
      <p className="text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link
          href="/login"
          className="inline-flex min-h-8 items-center font-medium text-foreground underline-offset-4 hover:underline [@media(pointer:coarse)]:min-h-11"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
