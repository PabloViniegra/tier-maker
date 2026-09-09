'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import {
  changePasswordSchema,
  verificationOtpSchema,
  type ChangePasswordInput,
} from '@/lib/auth-schema'

export function ProfilePasswordForm({ email }: { email: string }) {
  const [step, setStep] = useState<'idle' | 'code' | 'password'>('idle')
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: standardSchemaResolver(changePasswordSchema),
  })

  const sendCode = async () => {
    setSending(true)
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })
      if (result.error) {
        toast.error(
          result.error.message || 'Could not send the code. Try again.'
        )
        return
      }
      setStep('code')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const verifyCode = async () => {
    const parsed = verificationOtpSchema.safeParse({ otp })
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message || 'Enter the 6-digit code'
      )
      return
    }
    setVerifying(true)
    try {
      const result = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp: parsed.data.otp,
        type: 'email-verification',
      })
      if (result.error) {
        toast.error(
          result.error.message || 'That code is invalid or has expired.'
        )
        return
      }
      setStep('password')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      const result = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.password,
        revokeOtherSessions: true,
      })
      if (result.error) {
        toast.error(
          result.error.message || 'Could not update your password.'
        )
        return
      }
      toast.success('Your password has been updated.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (step === 'idle') {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-base">Password</h2>
        <p className="text-sm text-muted-foreground">
          We will email a code to {email} before you can set a new password.
        </p>
        <Button type="button" onClick={sendCode} disabled={sending}>
          {sending && <Loader2 className="animate-spin" aria-hidden="true" />}
          Send code
        </Button>
      </div>
    )
  }

  if (step === 'code') {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-base">Password</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verification-code">Verification code</Label>
          <InputOTP
            id="verification-code"
            maxLength={6}
            value={otp}
            onChange={setOtp}
            aria-label="Verification code"
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button type="button" onClick={verifyCode} disabled={verifying}>
          {verifying && <Loader2 className="animate-spin" aria-hidden="true" />}
          Verify code
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) => {
        const first = (
          ['currentPassword', 'password', 'confirmPassword'] as const
        ).find((k) => errs[k])
        if (first) setFocus(first)
      })}
      className="flex flex-col gap-4"
    >
      <h2 className="font-heading text-base">Password</h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
          aria-invalid={errors.currentPassword ? 'true' : 'false'}
        />
        {errors.currentPassword && (
          <p className="text-xs text-destructive" role="alert">
            {errors.currentPassword.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-xs text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-new-password">Confirm password</Label>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        Update password
      </Button>
    </form>
  )
}
