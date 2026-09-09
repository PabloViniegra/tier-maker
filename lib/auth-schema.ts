import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Display name is required')
      .min(2, 'Display name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const requestPasswordResetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const verificationOtpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type VerificationOtpInput = z.infer<typeof verificationOtpSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
