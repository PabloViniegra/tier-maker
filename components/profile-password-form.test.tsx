import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { authClient } from '@/lib/auth-client'
import { asMock } from '@/test/as-mock'

import { ProfilePasswordForm } from './profile-password-form'

describe('ProfilePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.elementFromPoint = vi.fn(() => null)
    asMock(authClient.emailOtp.sendVerificationOtp).mockResolvedValue({
      data: {},
      error: null,
    })
    asMock(authClient.emailOtp.checkVerificationOtp).mockResolvedValue({
      data: { success: true },
      error: null,
    })
    asMock(authClient.changePassword).mockResolvedValue({
      data: {},
      error: null,
    })
  })

  it('does not change the password before the email code is verified', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    expect(
      screen.queryByLabelText(/current password/i)
    ).not.toBeInTheDocument()
    expect(authClient.changePassword).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledWith({
        email: 'user@example.com',
        type: 'email-verification',
      })
    })
    expect(authClient.changePassword).not.toHaveBeenCalled()
  })

  it('changes the password after a valid code and the current password', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await screen.findByLabelText(/verification code/i)
    await user.type(screen.getByLabelText(/verification code/i), '482193')
    await user.click(screen.getByRole('button', { name: /verify code/i }))

    await user.type(await screen.findByLabelText(/current password/i), 'oldpass12')
    await user.type(screen.getByLabelText(/^new password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(authClient.emailOtp.checkVerificationOtp).toHaveBeenCalledWith({
        email: 'user@example.com',
        otp: '482193',
        type: 'email-verification',
      })
      expect(authClient.changePassword).toHaveBeenCalledWith({
        currentPassword: 'oldpass12',
        newPassword: 'password123',
        revokeOtherSessions: true,
      })
    })
  })
})
