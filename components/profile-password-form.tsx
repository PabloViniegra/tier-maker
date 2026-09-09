'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
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
import { cn } from '@/lib/utils'

type ChangePasswordError = {
  field: 'currentPassword' | 'password' | null
  message: string
}

function mapChangePasswordError(error: {
  code?: string
  message?: string
}): ChangePasswordError {
  switch (error.code) {
    case 'INVALID_PASSWORD':
      return {
        field: 'currentPassword',
        message: 'Current password is incorrect',
      }
    case 'PASSWORD_TOO_SHORT':
      return {
        field: 'password',
        message: 'New password must be at least 8 characters',
      }
    case 'PASSWORD_TOO_LONG':
      return {
        field: 'password',
        message: 'New password is too long',
      }
    default:
      return {
        field: null,
        message: error.message || 'Could not update your password.',
      }
  }
}

const passwordSteps = ['Request code', 'Verify code', 'Set password'] as const

function PasswordProgress({
  currentStep,
}: {
  currentStep: 1 | 2 | 3
}) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Step {currentStep} of 3
      </p>
      <ol
        className="grid grid-cols-3 gap-2"
        aria-label="Password change steps"
      >
        {passwordSteps.map((label, index) => {
          const step = index + 1
          const isCurrent = step === currentStep

          return (
            <li
              key={label}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex min-w-0 items-center gap-1.5 text-xs',
                step <= currentStep
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-sm text-[0.7rem] tabular-nums',
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border'
                )}
              >
                {step}
              </span>
              <span className="min-w-0 truncate">{label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function PasswordField({
  id,
  label,
  registration,
  error,
  autoComplete,
}: {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: string
  autoComplete: 'current-password' | 'new-password'
}) {
  const [show, setShow] = useState(false)
  const errorId = `${id}-error`
  const name = label.toLowerCase()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          className="pr-8"
          autoComplete={autoComplete}
          {...registration}
          type={show ? 'text' : 'password'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 h-full w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setShow((visible) => !visible)}
          aria-pressed={show}
          aria-label={show ? `Hide ${name}` : `Show ${name}`}
        >
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function ProfilePasswordForm({ email }: { email: string }) {
  const [step, setStep] = useState<'idle' | 'code' | 'password'>('idle')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string>()
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: standardSchemaResolver(changePasswordSchema),
  })

  const sendCode = async () => {
    setSending(true)
    setOtpError(undefined)
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

  const goBack = () => {
    setStep('idle')
    setOtp('')
    setOtpError(undefined)
  }

  const verifyCode = async () => {
    const parsed = verificationOtpSchema.safeParse({ otp })
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message || 'Enter the 6-digit code')
      return
    }
    setVerifying(true)
    setOtpError(undefined)
    try {
      const result = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp: parsed.data.otp,
        type: 'email-verification',
      })
      if (result.error) {
        setOtpError(
          result.error.message || 'That code is invalid or has expired.'
        )
        return
      }
      setStep('password')
    } catch {
      setOtpError('Something went wrong. Please try again.')
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
        const mapped = mapChangePasswordError(result.error)
        if (mapped.field) {
          setError(mapped.field, {
            type: 'server',
            message: mapped.message,
          })
          setFocus(mapped.field)
          return
        }
        toast.error(mapped.message)
        return
      }
      toast.success('Your password has been updated.')
      reset()
      setOtp('')
      setStep('idle')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (step === 'idle') {
    return (
      <div className="flex flex-col gap-3">
        <PasswordProgress currentStep={1} />
        <h2 className="font-heading text-base">Password</h2>
        <p className="text-sm text-muted-foreground">
          We’ll email a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email}</span> to
          confirm it’s you.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={sendCode}
          disabled={sending}
          aria-busy={sending}
        >
          {sending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {sending ? 'Sending code…' : 'Send code'}
        </Button>
      </div>
    )
  }

  if (step === 'code') {
    return (
      <div className="flex flex-col gap-4">
        <PasswordProgress currentStep={2} />
        <h2 className="font-heading text-base">Password</h2>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verification-code">Verification code</Label>
          <InputOTP
            id="verification-code"
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value)
              if (otpError) setOtpError(undefined)
            }}
            aria-label="Verification code"
            aria-invalid={otpError ? true : undefined}
            aria-describedby={[
              'verification-code-hint',
              otpError ? 'otp-error' : null,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p
            id="verification-code-hint"
            className="text-xs text-muted-foreground"
          >
            This code expires in five minutes. If you don’t see it, check your
            spam folder or resend the code.
          </p>
          {otpError && (
            <p id="otp-error" className="text-xs text-destructive" role="alert">
              {otpError}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={verifyCode}
          disabled={verifying || otp.length !== 6}
          aria-busy={verifying}
        >
          {verifying && <Loader2 className="animate-spin" aria-hidden="true" />}
          {verifying ? 'Verifying code…' : 'Verify code'}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={goBack}>
            Back
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={sendCode}
            disabled={sending}
            aria-busy={sending}
          >
            {sending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {sending ? 'Sending again…' : 'Resend code'}
          </Button>
        </div>
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
      <PasswordProgress currentStep={3} />
      <h2 className="font-heading text-base">Password</h2>
      <p className="text-sm text-muted-foreground">
        At least 8 characters. Other sessions will be signed out.
      </p>
      <PasswordField
        id="current-password"
        label="Current password"
        autoComplete="current-password"
        registration={register('currentPassword')}
        error={errors.currentPassword?.message}
      />
      <PasswordField
        id="new-password"
        label="New password"
        autoComplete="new-password"
        registration={register('password')}
        error={errors.password?.message}
      />
      <PasswordField
        id="confirm-new-password"
        label="Confirm password"
        autoComplete="new-password"
        registration={register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />
      <Button
        type="submit"
        variant="outline"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Updating password…' : 'Update password'}
      </Button>
    </form>
  )
}
