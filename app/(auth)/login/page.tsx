import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your Tier Maker account to create and manage your tier lists.',
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-center font-heading text-lg font-semibold tracking-tight text-card-foreground">
          Welcome back
        </h2>
        <p className="text-center text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
