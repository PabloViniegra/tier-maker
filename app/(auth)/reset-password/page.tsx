import type { Metadata } from 'next'

import { ResetPasswordForm } from '@/components/password-reset-form'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Choose a new password for your Tier Maker account.',
  referrer: 'no-referrer',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams
  const linkUsable = Boolean(token) && !error

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          {linkUsable ? 'Choose a new password' : 'Reset link unavailable'}
        </h1>
        {linkUsable && (
          <p className="text-sm text-muted-foreground">
            Use at least eight characters
          </p>
        )}
      </div>
      <ResetPasswordForm token={token} invalid={Boolean(error)} />
    </div>
  )
}
