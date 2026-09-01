import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import * as toggleLikeAction from '@/app/explore/_actions/toggle-like'
import { LikeButton } from '../like-button'
import { asMock } from '@/test/as-mock'

const baseProps = {
  templateId: 'tpl-1',
  initialCount: 5,
  initialIsLiked: false,
  isAuthenticated: true,
}

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(toggleLikeAction, 'toggleLike')
  })

  it('renders the like count', () => {
    render(<LikeButton {...baseProps} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calls toggleLike when authenticated user clicks', async () => {
    asMock(toggleLikeAction.toggleLike).mockResolvedValue({ liked: true })
    render(<LikeButton {...baseProps} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(toggleLikeAction.toggleLike).toHaveBeenCalledWith('tpl-1'))
  })

  it('keeps incremented count after successful like', async () => {
    asMock(toggleLikeAction.toggleLike).mockResolvedValue({ liked: true })
    render(<LikeButton {...baseProps} initialCount={5} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument())
  })

  it('links to sign-in when unauthenticated', () => {
    render(<LikeButton {...baseProps} isAuthenticated={false} />)

    const link = screen.getByRole('link', { name: 'Like' })
    expect(link).toHaveAttribute('href', '/login')
    expect(toggleLikeAction.toggleLike).not.toHaveBeenCalled()
  })

  it('shows error toast and does not increment count on server error', async () => {
    asMock(toggleLikeAction.toggleLike).mockRejectedValue(new Error('Server error'))
    render(<LikeButton {...baseProps} initialCount={5} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
