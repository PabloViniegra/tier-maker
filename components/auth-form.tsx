'use client'

import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
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

interface AuthFormProps {
  mode: 'login' | 'register'
}

function GoogleIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' className='size-4'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  )
}

function PasswordInput({ id, placeholder, registration, error }: {
  id: string
  placeholder: string
  registration: UseFormRegisterReturn
  error?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <>
      <div className='relative'>
        <Input
          id={id}
          placeholder={placeholder}
          className='pr-8'
          {...registration}
          type={show ? 'text' : 'password'}
          aria-invalid={error ? 'true' : 'false'}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          className='absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide' : 'Show'}
        >
          {show ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {error && <p className='mt-1 text-xs text-destructive'>{error}</p>}
    </>
  )
}

function GoogleButton() {
  return (
    <>
      <Button
        type='button'
        variant='outline'
        className='w-full gap-2'
        onClick={() => toast.info('Google sign-in coming soon')}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <div className='relative my-1'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-border' />
        </div>
        <div className='relative flex justify-center text-xs'>
          <span className='bg-card px-2 text-muted-foreground'>or</span>
        </div>
      </div>
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
    // Zod v4 type compat: @hookform/resolvers expects Zod v3 internals
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

      router.push('/')
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
        />
        {errors.email && (
          <p className='text-xs text-destructive'>{errors.email.message}</p>
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
    // Zod v4 type compat: @hookform/resolvers expects Zod v3 internals
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

      router.push('/')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <GoogleButton />
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='name'>Name</Label>
        <Input
          id='name'
          type='text'
          placeholder='Your name'
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className='text-xs text-destructive'>{errors.name.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          placeholder='you@example.com'
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className='text-xs text-destructive'>{errors.email.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='password'>Password</Label>
        <PasswordInput
          id='password'
          placeholder='••••••••'
          registration={register('password')}
          error={errors.password?.message}
        />
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='confirmPassword'>Confirm password</Label>
        <PasswordInput
          id='confirmPassword'
          placeholder='••••••••'
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button type='submit' disabled={isSubmitting} className='mt-2 w-full'>
        Sign up
      </Button>
    </form>
  )
}

export function AuthForm({ mode }: AuthFormProps) {
  return mode === 'login' ? <LoginForm /> : <RegisterForm />
}
