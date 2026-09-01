import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { mockRequestPasswordReset, mockResetPassword, mockToastError } =
  vi.hoisted(() => ({
    mockRequestPasswordReset: vi.fn(),
    mockResetPassword: vi.fn(),
    mockToastError: vi.fn(),
  }))

vi.mock('sonner', () => ({ toast: { error: mockToastError } }))
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    requestPasswordReset: mockRequestPasswordReset,
    resetPassword: mockResetPassword,
  },
}))

import {
  RequestPasswordResetForm,
  ResetPasswordForm,
} from './password-reset-form'

describe('password reset forms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests a reset link without exposing account existence', async () => {
    mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null })
    const user = userEvent.setup()
    render(<RequestPasswordResetForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: 'user@example.com',
        redirectTo: '/reset-password',
      })
    })
    expect(await screen.findByText(/if an account exists/i)).toBeInTheDocument()
  })

  it('resets the password with the token from the email link', async () => {
    mockResetPassword.mockResolvedValue({ data: {}, error: null })
    const user = userEvent.setup()
    render(<ResetPasswordForm token="reset-token" />)

    await user.type(screen.getByLabelText(/^new password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^reset password$/i }))

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        newPassword: 'password123',
        token: 'reset-token',
      })
    })
    expect(await screen.findByText(/password has been updated/i)).toBeVisible()
  })

  it('rejects invalid reset links', () => {
    render(<ResetPasswordForm invalid />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      /invalid or has expired/i
    )
    expect(mockResetPassword).not.toHaveBeenCalled()
  })
})
