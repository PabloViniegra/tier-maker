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
    asMock(authClient.sendVerificationEmail).mockClear()
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

  it('shows an inline error on failed login', async () => {
    asMock(authClient.signIn.email).mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    })

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials'
    )
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveClass(
      'underline'
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('places email sign-in before Google', () => {
    render(<AuthForm mode="login" />)
    const signIn = screen.getByRole('button', { name: /sign in/i })
    const google = screen.getByRole('button', { name: /continue with google/i })
    expect(
      signIn.compareDocumentPosition(google) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('submits values painted by the browser without a React change event', async () => {
    asMock(authClient.signIn.email).mockResolvedValue({
      data: { session: {} },
      error: null,
    })

    render(<AuthForm mode="login" />)
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/^password$/i)
    if (
      !(email instanceof HTMLInputElement) ||
      !(password instanceof HTMLInputElement)
    ) {
      throw new Error('expected email and password inputs')
    }
    email.value = 'user@example.com'
    password.value = 'password123'

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

  it('offers a resend action when the email is not verified', async () => {
    asMock(authClient.signIn.email).mockResolvedValue({
      data: null,
      error: { code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' },
    })
    asMock(authClient.sendVerificationEmail).mockResolvedValue({
      data: {},
      error: null,
    })

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /check your email to verify your account/i
    )
    await user.click(screen.getByRole('button', { name: /resend verification/i }))

    await waitFor(() => {
      expect(authClient.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com' })
      )
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
    asMock(toast.success).mockClear()
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
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i, { selector: 'input' })).toBeInTheDocument()
  })

  it('enables email registration', () => {
    render(<AuthForm mode="register" />)

    expect(screen.getByLabelText(/display name/i)).toBeEnabled()
    expect(screen.getByLabelText(/email/i)).toBeEnabled()
    expect(screen.getByLabelText(/^password$/i)).toBeEnabled()
    expect(screen.getByLabelText(/confirm password/i, { selector: 'input' })).toBeEnabled()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeEnabled()
  })

  it('asks the user to verify their email after registration', async () => {
    asMock(authClient.signUp.email).mockResolvedValue({
      data: { user: {} },
      error: null,
    })
    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i, { selector: 'input' }), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(
      await screen.findByRole('heading', { name: /check your email/i })
    ).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      /open that inbox to activate your account/i
    )
    expect(
      screen.getByRole('button', { name: /resend verification/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /sign up/i })
    ).not.toBeInTheDocument()
    expect(mockAssign).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('shows the password rule before submit', () => {
    render(<AuthForm mode="register" />)
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
  })

  it('uses email autocomplete on the register email field', () => {
    render(<AuthForm mode="register" />)
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'email'
    )
  })

  it('shows an inline error on failed registration', async () => {
    asMock(authClient.signUp.email).mockResolvedValue({
      data: null,
      error: { message: 'Email already in use' },
    })

    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i, { selector: 'input' }), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email already in use'
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('submits values painted by the browser without a React change event', async () => {
    asMock(authClient.signUp.email).mockResolvedValue({
      data: { user: {} },
      error: null,
    })

    render(<AuthForm mode="register" />)
    const name = screen.getByLabelText(/name/i)
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/^password$/i)
    const confirm = screen.getByLabelText(/confirm password/i, { selector: 'input' })
    if (
      !(name instanceof HTMLInputElement) ||
      !(email instanceof HTMLInputElement) ||
      !(password instanceof HTMLInputElement) ||
      !(confirm instanceof HTMLInputElement)
    ) {
      throw new Error('expected register inputs')
    }
    name.value = 'Jane Doe'
    email.value = 'jane@example.com'
    password.value = 'password123'
    confirm.value = 'password123'

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        })
      )
    })
  })
})
