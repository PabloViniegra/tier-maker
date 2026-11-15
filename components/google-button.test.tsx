import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoogleButton } from './google-button'
import { asMock } from '@/test/as-mock'

describe('GoogleButton', () => {
  it('renders a button with Google icon and text', () => {
    render(<GoogleButton />)
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument()
  })

  it('calls authClient.signIn.social with google provider when clicked', async () => {
    const { authClient } = await import('@/lib/auth-client')
    render(<GoogleButton />)
    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/dashboard',
    })
  })

  it('marks the button busy while Google sign-in is pending', async () => {
    const { authClient } = await import('@/lib/auth-client')
    asMock(authClient.signIn.social).mockReturnValue(new Promise(() => {}))
    render(<GoogleButton />)
    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
  })

  it('shows error toast when sign-in fails', async () => {
    const user = userEvent.setup()
    const { authClient } = await import('@/lib/auth-client')
    const { toast } = await import('sonner')
    asMock(authClient.signIn.social).mockRejectedValueOnce(
      new Error('Auth failed')
    )
    render(<GoogleButton />)
    const button = screen.getByRole('button', { name: /continue with google/i })
    await user.click(button)
    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong. Please try again.'
    )
    expect(button).not.toBeDisabled()
  })

  it('allows retry when Google returns an error response', async () => {
    const user = userEvent.setup()
    const { authClient } = await import('@/lib/auth-client')
    const { toast } = await import('sonner')
    asMock(toast.error).mockClear()
    asMock(authClient.signIn.social).mockResolvedValueOnce({
      data: null,
      error: { message: 'Provider unavailable', status: 503 },
    })
    render(<GoogleButton />)
    const button = screen.getByRole('button', { name: /continue with google/i })

    await user.click(button)

    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong. Please try again.'
    )
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('aria-busy', 'false')

    asMock(authClient.signIn.social).mockReturnValueOnce(new Promise(() => {}))
    await user.click(button)
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('stays busy while a successful response redirects to Google', async () => {
    const user = userEvent.setup()
    const { authClient } = await import('@/lib/auth-client')
    const { toast } = await import('sonner')
    asMock(toast.error).mockClear()
    asMock(authClient.signIn.social).mockResolvedValueOnce({
      data: { url: 'https://accounts.google.com', redirect: true },
      error: null,
    })
    render(<GoogleButton />)
    const button = screen.getByRole('button', { name: /continue with google/i })

    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(toast.error).not.toHaveBeenCalled()
  })
})
