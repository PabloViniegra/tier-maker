'use client'

import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Info } from 'lucide-react'
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

function PasswordInput({ id, placeholder, registration, error, disabled }: {
  id: string
  placeholder: string
  registration: UseFormRegisterReturn
  error?: string
  disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <>
      <div className='relative'>
        <Input
          id={id}
          placeholder={placeholder}
          className='pr-8'
          disabled={disabled}
          {...registration}
          type={show ? 'text' : 'password'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          disabled={disabled}
          className='absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {error && <p id={`${id}-error`} className='mt-1 text-xs text-destructive' role='alert'>{error}</p>}
    </>
  )
}

function LoginForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    // Zod v4 / @hookform/resolvers compat: zodResolver overloads don't infer from v4 classic types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema as any),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        toast.error(result.error.message || 'Login failed')
        return
      }

      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <GoogleButton />
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          placeholder='you@example.com'
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id='email-error' className='text-xs text-destructive' role='alert'>{errors.email.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='password'>Password</Label>
          <Link
            href='/forgot-password'
            className='text-xs text-muted-foreground transition-colors hover:text-foreground'
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id='password'
          placeholder='••••••••'
          registration={register('password')}
          error={errors.password?.message}
        />
      </div>

      <Button type='submit' disabled={isSubmitting} className='mt-2 w-full'>
        Sign in
      </Button>
    </form>
  )
}

function RegisterForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    // Zod v4 / @hookform/resolvers compat: zodResolver overloads don't infer from v4 classic types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registerSchema as any),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        toast.error(result.error.message || 'Registration failed')
        return
      }

      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <GoogleButton />
      <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30'>
        <Info className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400' />
        <p className='text-sm text-amber-800 dark:text-amber-200'>
          Email registration is temporarily disabled. Please sign up with Google.
        </p>
      </div>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='name'>Name</Label>
        <Input
          id='name'
          type='text'
          placeholder='Your name'
          disabled
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id='name-error' className='text-xs text-destructive' role='alert'>{errors.name.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          placeholder='you@example.com'
          disabled
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id='email-error' className='text-xs text-destructive' role='alert'>{errors.email.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='password'>Password</Label>
        <PasswordInput
          id='password'
          placeholder='••••••••'
          disabled
          registration={register('password')}
          error={errors.password?.message}
        />
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='confirmPassword'>Confirm password</Label>
        <PasswordInput
          id='confirmPassword'
          placeholder='••••••••'
          disabled
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button type='submit' disabled className='mt-2 w-full'>
        Sign up
      </Button>
    </form>
  )
}

export function AuthForm({ mode }: AuthFormProps) {
  return mode === 'login' ? <LoginForm /> : <RegisterForm />
}
