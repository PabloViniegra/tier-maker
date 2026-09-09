import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { authClient } from '@/lib/auth-client'
import { asMock } from '@/test/as-mock'

import { ProfilePasswordForm } from './profile-password-form'

const passwordInput = (name: RegExp) =>
  screen.getByLabelText(name, { selector: 'input' })

const findPasswordInput = (name: RegExp) =>
  screen.findByLabelText(name, { selector: 'input' })

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

  it('marks the password loading indicator for reduced motion', async () => {
    let resolveRequest!: (value: { data: Record<string, never>; error: null }) => void
    asMock(authClient.emailOtp.sendVerificationOtp).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        })
    )
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))

    expect(
      screen
        .getByRole('button', { name: /sending code/i })
        .querySelector('svg')
    ).toHaveClass('motion-reduce:animate-none')

    resolveRequest({ data: {}, error: null })
    await screen.findByRole('button', { name: /verify code/i })
  })

  it('keeps verify disabled until six digits are entered', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    const verify = await screen.findByRole('button', { name: /verify code/i })
    expect(verify).toBeDisabled()

    await user.type(screen.getByLabelText(/verification code/i), '482193')
    expect(verify).toBeEnabled()
  })

  it('returns to send code when back is pressed', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await screen.findByLabelText(/verification code/i)
    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(
      await screen.findByRole('button', { name: /send code/i })
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByLabelText(/verification code/i)
      ).not.toBeInTheDocument()
    })
  })

  it('resends the code without leaving the verification step', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await screen.findByLabelText(/verification code/i)
    await user.click(screen.getByRole('button', { name: /resend/i }))

    await waitFor(() => {
      expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledTimes(2)
    })
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
  })

  it('keeps the email visible on the code step', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await screen.findByLabelText(/verification code/i)

    expect(screen.getByText(/user@example.com/)).toBeInTheDocument()
  })

  it('shows progress and expiration guidance throughout the password flow', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    expect(screen.getByRole('status')).toHaveTextContent(/step 1 of 3/i)

    await user.click(screen.getByRole('button', { name: /send code/i }))

    expect(await screen.findByText(/step 2 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/code expires in five minutes/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /resend code/i })
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/verification code/i), '482193')
    await user.click(screen.getByRole('button', { name: /verify code/i }))

    expect(await screen.findByText(/step 3 of 3/i)).toBeInTheDocument()
  })

  it('shows an inline error when the code is invalid', async () => {
    asMock(authClient.emailOtp.checkVerificationOtp).mockResolvedValue({
      data: null,
      error: { message: 'That code is invalid or has expired.' },
    })
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await user.type(
      await screen.findByLabelText(/verification code/i),
      '000000'
    )
    await user.click(screen.getByRole('button', { name: /verify code/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid or has expired/i
    )
  })

  it('warns that other sessions will end before the password is updated', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await user.type(
      await screen.findByLabelText(/verification code/i),
      '482193'
    )
    await user.click(screen.getByRole('button', { name: /verify code/i }))

    expect(
      await screen.findByText(/other sessions will be signed out/i)
    ).toBeInTheDocument()
  })

  it('explains that the current password is wrong instead of a generic invalid password', async () => {
    asMock(authClient.changePassword).mockResolvedValue({
      data: null,
      error: { code: 'INVALID_PASSWORD', message: 'Invalid password' },
    })
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await user.type(
      await screen.findByLabelText(/verification code/i),
      '482193'
    )
    await user.click(screen.getByRole('button', { name: /verify code/i }))
    await user.type(await findPasswordInput(/current password/i), 'oldpass12')
    await user.type(passwordInput(/^new password$/i), 'password123')
    await user.type(passwordInput(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /current password is incorrect/i
    )
    expect(passwordInput(/current password/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('lets the user reveal the current password', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await user.type(
      await screen.findByLabelText(/verification code/i),
      '482193'
    )
    await user.click(screen.getByRole('button', { name: /verify code/i }))
    const current = await findPasswordInput(/current password/i)
    expect(current).toHaveAttribute('type', 'password')

    await user.click(
      screen.getByRole('button', { name: /show current password/i })
    )
    expect(current).toHaveAttribute('type', 'text')
  })

  it('changes the password after a valid code and the current password', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm email="user@example.com" />)

    await user.click(screen.getByRole('button', { name: /send code/i }))
    await screen.findByLabelText(/verification code/i)
    await user.type(screen.getByLabelText(/verification code/i), '482193')
    await user.click(screen.getByRole('button', { name: /verify code/i }))

    await user.type(await findPasswordInput(/current password/i), 'oldpass12')
    await user.type(passwordInput(/^new password$/i), 'password123')
    await user.type(passwordInput(/confirm password/i), 'password123')
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
