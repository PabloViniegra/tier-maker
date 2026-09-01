'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  type RequestPasswordResetInput,
  type ResetPasswordInput,
} from '@/lib/auth-schema'

export function RequestPasswordResetForm() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(requestPasswordResetSchema as any),
  })

  const onSubmit = async (data: RequestPasswordResetInput) => {
    try {
      const result = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: '/reset-password',
      })

      if (result.error) {
        toast.error(result.error.message || 'Password reset request failed')
        return
      }

      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center" role="status">
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, a password reset link is on its
          way.
        </p>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="outline"
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'reset-email-error' : undefined}
        />
        {errors.email && (
          <p
            id="reset-email-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        Send reset link
      </Button>
    </form>
  )
}

export function ResetPasswordForm({
  token,
  invalid,
}: {
  token?: string
  invalid?: boolean
}) {
  const [complete, setComplete] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(resetPasswordSchema as any),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return

    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      })

      if (result.error) {
        toast.error(result.error.message || 'Password reset failed')
        return
      }

      setComplete(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (complete) {
    return (
      <div className="flex flex-col gap-4 text-center" role="status">
        <p className="text-sm text-muted-foreground">
          Your password has been updated. You can now sign in.
        </p>
        <Button render={<Link href="/login" />} nativeButton={false}>
          Sign in
        </Button>
      </div>
    )
  }

  if (!token || invalid) {
    return (
      <div className="flex flex-col gap-4 text-center" role="alert">
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired.
        </p>
        <Button
          render={<Link href="/forgot-password" />}
          nativeButton={false}
          variant="outline"
        >
          Request a new link
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={
            errors.password ? 'reset-password-error' : undefined
          }
        />
        {errors.password && (
          <p
            id="reset-password-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password-confirmation">Confirm password</Label>
        <Input
          id="reset-password-confirmation"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          aria-describedby={
            errors.confirmPassword
              ? 'reset-password-confirmation-error'
              : undefined
          }
        />
        {errors.confirmPassword && (
          <p
            id="reset-password-confirmation-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        Reset password
      </Button>
    </form>
  )
}
