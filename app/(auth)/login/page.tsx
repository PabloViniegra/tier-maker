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
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Access lists you&apos;ve saved
        </p>
      </div>
      <AuthForm mode="login" />
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="inline-flex min-h-8 items-center font-medium text-foreground underline-offset-4 hover:underline [@media(pointer:coarse)]:min-h-11"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
