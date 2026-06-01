import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = vi.fn()
const mockToastError = vi.fn()
const mockSignInEmail = vi.fn()
const mockSignUpEmail = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('sonner', () => ({
  toast: { error: mockToastError, success: vi.fn() },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: mockSignInEmail },
    signUp: { email: mockSignUpEmail },
  },
}))

import { AuthForm } from '@/components/auth-form'
import { authClient } from '@/lib/auth-client'

describe('AuthForm — login mode', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    mockToastError.mockClear()
    mockSignInEmail.mockClear()
    mockSignUpEmail.mockClear()
  })

  it('renders email and password fields in login mode', () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
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

  it('shows validation error for invalid email', async () => {
    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('calls signIn with correct data on valid submit', async () => {
    mockSignInEmail.mockResolvedValue({ data: { session: {} }, error: null } as never)

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          password: 'password123',
        })
      )
    })
  })

  it('redirects to home on successful login', async () => {
    mockSignInEmail.mockResolvedValue({ data: { session: {} }, error: null } as never)

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('shows error toast on failed login', async () => {
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    } as never)

    render(<AuthForm mode="login" />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})

describe('AuthForm — register mode', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all fields in register mode', () => {
    render(<AuthForm mode="register" />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('shows validation errors for short name and password', async () => {
    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'J')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'short')
    await user.type(screen.getByLabelText(/confirm password/i), 'short')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('calls signUp with correct data on valid submit', async () => {
    mockSignUpEmail.mockResolvedValue({ data: { user: {} }, error: null } as never)

    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        })
      )
    })
  })

  it('redirects to home on successful registration', async () => {
    mockSignUpEmail.mockResolvedValue({ data: { user: {} }, error: null } as never)

    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('shows error toast on failed registration', async () => {
    mockSignUpEmail.mockResolvedValue({
      data: null,
      error: { message: 'Email already in use' },
    } as never)

    render(<AuthForm mode="register" />)
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Email already in use')
    })
  })
})
