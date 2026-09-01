import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Create a free Tier Maker account and start building and sharing tier lists instantly.',
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-center font-heading text-lg font-semibold tracking-tight text-card-foreground">
          Create an account
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>
      <AuthForm mode="register" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
