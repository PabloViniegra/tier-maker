import { vi } from 'vitest'

export const signIn = {
  email: vi.fn(),
  social: vi.fn(),
}

export const signUp = {
  email: vi.fn(),
}

export const signOut = vi.fn()

export const forgetPassword = vi.fn()
export const resetPassword = vi.fn()
export const requestPasswordReset = vi.fn()
export const sendVerificationEmail = vi.fn()
export const changePassword = vi.fn()
export const deleteUser = vi.fn()
export const emailOtp = {
  sendVerificationOtp: vi.fn(),
  checkVerificationOtp: vi.fn(),
}

export const useSession = vi.fn(() => ({
  data: null,
  isPending: false,
}))

export const authClient = {
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  forgetPassword,
  resetPassword,
  sendVerificationEmail,
  changePassword,
  deleteUser,
  emailOtp,
  useSession,
}
