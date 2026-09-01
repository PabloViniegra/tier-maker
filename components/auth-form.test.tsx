import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { AuthForm } from '@/components/auth-form'
import { asMock } from '@/test/as-mock'

const mockAssign = vi.fn()

describe('AuthForm — login mode', () => {
  const user = userEvent.setup()
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    mockAssign.mockClear()
    asMock(toast.error).mockClear()
    asMock(authClient.signIn.email).mockClear()
    asMock(authClient.signUp.email).mockClear()
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, assign: mockAssign },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    })
  })

  it('renders email and password fields in login mode', () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument()
  })

  it('shows validation errors for empty fields on submit', async () => {
    render(<AuthForm mode="login" />)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('calls signIn with correct data on valid submit', async () => {
    asMock(authClient.signIn.email).mockResolvedValue({
      data: { session: {} },
      error: null,
    })

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          password: 'password123',
        })
      )
    })
  })

  it('redirects to dashboard on successful login', async () => {
    asMock(authClient.signIn.email).mockResolvedValue({
      data: { session: {} },
      error: null,
    })

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error toast on failed login', async () => {
    asMock(authClient.signIn.email).mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    })

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})

describe('AuthForm — register mode', () => {
  const user = userEvent.setup()
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    mockAssign.mockClear()
    asMock(toast.error).mockClear()
    asMock(authClient.signIn.email).mockClear()
    asMock(authClient.signUp.email).mockClear()
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, assign: mockAssign },
    })
  })

  it('renders all fields in register mode', () => {
    render(<AuthForm mode="register" />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('enables email registration', () => {
    render(<AuthForm mode="register" />)

    expect(screen.getByLabelText(/name/i)).toBeEnabled()
    expect(screen.getByLabelText(/email/i)).toBeEnabled()
    expect(screen.getByLabelText(/^password$/i)).toBeEnabled()
    expect(screen.getByLabelText(/confirm password/i)).toBeEnabled()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeEnabled()
  })

  it('asks the user to verify their email after registration', async () => {
    asMock(authClient.signUp.email).mockResolvedValue({ data: { user: {} }, error: null })
    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Check your email to verify your account.'
      )
    })
    expect(mockAssign).not.toHaveBeenCalled()
  })
})
