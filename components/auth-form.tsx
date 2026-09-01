'use client'

import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toast } from 'sonner'
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
import { GoogleButton } from './google-button'

interface AuthFormProps {
  mode: 'login' | 'register'
}

function PasswordInput({
  id,
  placeholder,
  registration,
  error,
  disabled,
  autoComplete,
}: {
  id: string
  placeholder: string
  registration: UseFormRegisterReturn
  error?: string
  disabled?: boolean
  autoComplete: 'current-password' | 'new-password'
}) {
  const [show, setShow] = useState(false)
  return (
    <>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          className="pr-8"
          disabled={disabled}
          autoComplete={autoComplete}
          {...registration}
          type={show ? 'text' : 'password'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-xs text-destructive"
          role="alert"
        >
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
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: standardSchemaResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      })

      if (result.error) {
        if (result.error.code === 'EMAIL_NOT_VERIFIED') {
          toast.error('Check your email to verify your account.')
          return
        }
        toast.error(
          result.error.message || 'Login failed. Check your email and password.'
        )
        return
      }

      window.location.assign('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) => {
        const first = (['email', 'password'] as const).find((k) => errs[k])
        if (first) setFocus(first)
      })}
      className="flex flex-col gap-4"
    >
      <GoogleButton />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com…"
          autoComplete="username"
          spellCheck={false}
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
        <div className="flex items-center justify-between">
          <Label htmlFor="current-password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="current-password"
          placeholder="••••••••"
          registration={register('password')}
          error={errors.password?.message}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting && (
          <Loader2 className="animate-spin" aria-hidden="true" />
        )}
        Sign in
      </Button>
    </form>
  )
}

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      })

      if (result.error) {
        toast.error(
          result.error.message ||
            'Registration failed. Check your details and try again.'
        )
        return
      }

      toast.success('Check your email to verify your account.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) => {
        const first = (
          ['name', 'email', 'password', 'confirmPassword'] as const
        ).find((k) => errs[k])
        if (first) setFocus(first)
      })}
      className="flex flex-col gap-4"
    >
      <GoogleButton />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Ada Lovelace…"
          autoComplete="name"
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
          placeholder="you@example.com…"
          autoComplete="username"
          spellCheck={false}
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
        <Label htmlFor="new-password">Password</Label>
        <PasswordInput
          id="new-password"
          placeholder="••••••••"
          registration={register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password-confirmation">Confirm password</Label>
        <PasswordInput
          id="new-password-confirmation"
          placeholder="••••••••"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting && (
          <Loader2 className="animate-spin" aria-hidden="true" />
        )}
        Sign up
      </Button>
    </form>
  )
}

export function AuthForm({ mode }: AuthFormProps) {
  return mode === 'login' ? <LoginForm /> : <RegisterForm />
}
