'use client'

import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/auth-schema'
import { cn } from '@/lib/utils'
import { GoogleButton } from './google-button'

interface AuthFormProps {
  mode: 'login' | 'register'
}

const fieldClassName =
  'h-8 text-base md:text-sm [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:md:text-base'
const controlClassName = 'h-8 [@media(pointer:coarse)]:h-11'

function PasswordInput({
  id,
  registration,
  error,
  disabled,
  autoComplete,
  hide,
  describedBy,
  toggleName,
}: {
  id: string
  registration: UseFormRegisterReturn
  error?: string
  disabled?: boolean
  autoComplete: 'current-password' | 'new-password'
  hide?: boolean
  describedBy?: string
  toggleName: string
}) {
  const [show, setShow] = useState(false)
  if (hide && show) {
    setShow(false)
  }
  const visible = Boolean(show && !hide)

  const errorId = `${id}-error`
  const ariaDescribedBy = [describedBy, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div className="relative">
        <Input
          id={id}
          className={`${fieldClassName} pr-8 [@media(pointer:coarse)]:pr-11`}
          disabled={disabled}
          autoComplete={autoComplete}
          {...registration}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy || undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="absolute inset-y-0 right-0 h-full w-8 text-muted-foreground hover:text-foreground [@media(pointer:coarse)]:w-11"
          onClick={() => setShow((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? `Hide ${toggleName}` : `Show ${toggleName}`}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: standardSchemaResolver(loginSchema),
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [credentialsError, setCredentialsError] = useState(false)

  const onValid = async (data: LoginInput) => {
    setFormError(null)
    setUnverifiedEmail(null)
    setCredentialsError(false)
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      })

      if (result.error) {
        if (result.error.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(data.email)
          setFormError('Check your email to verify your account.')
          return
        }
        setCredentialsError(true)
        setError('password', {
          type: 'server',
          message:
            result.error.message ||
            'Login failed. Check your email and password.',
        })
        return
      }

      window.location.assign('/dashboard')
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  }

  const onInvalid = (errs: typeof errors) => {
    const first = (['email', 'password'] as const).find((k) => errs[k])
    if (first) setFocus(first)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget)
    setValue('email', String(fd.get('email') ?? ''), { shouldValidate: false })
    setValue('password', String(fd.get('password') ?? ''), {
      shouldValidate: false,
    })
    void handleSubmit(onValid, onInvalid)(e)
  }

  const resendVerification = async () => {
    if (!unverifiedEmail) return
    setResending(true)
    try {
      const result = await authClient.sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: '/dashboard',
      })
      if (result.error) {
        setFormError(
          result.error.message || 'Could not resend the email. Try again.'
        )
        return
      }
      setFormError('Check your email to verify your account.')
    } catch {
      setFormError('Could not resend the email. Try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          spellCheck={false}
          className={fieldClassName}
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="current-password">Password</Label>
          <Link
            href="/forgot-password"
            className={cn(
              'inline-flex min-h-8 items-center text-sm [@media(pointer:coarse)]:min-h-11',
              credentialsError
                ? 'font-medium text-foreground underline underline-offset-4'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="current-password"
          registration={register('password')}
          error={errors.password?.message}
          autoComplete="current-password"
          hide={isSubmitting}
          toggleName="password"
        />
      </div>

      {formError && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-destructive" role="alert">
            {formError}
          </p>
          {unverifiedEmail && (
            <Button
              type="button"
              variant="outline"
              className={`w-full ${controlClassName}`}
              disabled={resending}
              aria-busy={resending}
              onClick={resendVerification}
            >
              {resending && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              Resend verification
            </Button>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className={`mt-2 w-full ${controlClassName}`}
      >
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        Sign in
      </Button>
      <GoogleButton divider="before" />
    </form>
  )
}

function RegisterConfirmation({ email }: { email: string }) {
  const [resending, setResending] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const resendVerification = async () => {
    setResending(true)
    setResendError(null)
    setResendStatus(null)
    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: '/dashboard',
      })
      if (result.error) {
        setResendError(
          result.error.message || 'Could not resend the email. Try again.'
        )
        return
      }
      setResendStatus('Verification email sent again.')
    } catch {
      setResendError('Could not resend the email. Try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{' '}
          <span className="text-foreground">{email}</span>
        </p>
      </div>
      <p className="text-sm text-foreground" role="status">
        Open that inbox to activate your account.
      </p>
      {resendError && (
        <p className="text-xs text-destructive" role="alert">
          {resendError}
        </p>
      )}
      {resendStatus && (
        <p className="text-xs text-muted-foreground" role="status">
          {resendStatus}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className={`w-full ${controlClassName}`}
        disabled={resending}
        aria-busy={resending}
        onClick={resendVerification}
      >
        {resending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Resend verification
      </Button>
      <p className="text-sm text-muted-foreground">
        Already verified?{' '}
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

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const onValid = async (data: RegisterInput) => {
    setFormError(null)
    try {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      })

      if (result.error) {
        setFormError(
          result.error.message ||
            'Registration failed. Check your details and try again.'
        )
        return
      }

      setPendingEmail(data.email)
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  }

  const onInvalid = (errs: typeof errors) => {
    const first = (
      ['name', 'email', 'password', 'confirmPassword'] as const
    ).find((k) => errs[k])
    if (first) setFocus(first)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget)
    setValue('name', String(fd.get('name') ?? ''), { shouldValidate: false })
    setValue('email', String(fd.get('email') ?? ''), { shouldValidate: false })
    setValue('password', String(fd.get('password') ?? ''), {
      shouldValidate: false,
    })
    setValue('confirmPassword', String(fd.get('confirmPassword') ?? ''), {
      shouldValidate: false,
    })
    void handleSubmit(onValid, onInvalid)(e)
  }

  if (pendingEmail) {
    return <RegisterConfirmation email={pendingEmail} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Save the lists you make
        </p>
      </div>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            className={fieldClassName}
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            className={fieldClassName}
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="new-password">Password</Label>
            <span
              id="new-password-hint"
              className="text-xs text-muted-foreground"
            >
              At least 8 characters
            </span>
          </div>
          <PasswordInput
            id="new-password"
            registration={register('password')}
            error={errors.password?.message}
            autoComplete="new-password"
            hide={isSubmitting}
            describedBy="new-password-hint"
            toggleName="password"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password-confirmation">Confirm password</Label>
          <PasswordInput
            id="new-password-confirmation"
            registration={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            hide={isSubmitting}
            toggleName="confirm password"
          />
        </div>

        {formError && (
          <p className="text-xs text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={`mt-2 w-full ${controlClassName}`}
        >
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          Sign up
        </Button>
        <GoogleButton divider="before" />
      </form>
      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
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

export function AuthForm({ mode }: AuthFormProps) {
  return mode === 'login' ? <LoginForm /> : <RegisterForm />
}
