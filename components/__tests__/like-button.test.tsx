import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const { mockToggleLike, mockToastError, mockRouterPush } = vi.hoisted(() => ({
  mockToggleLike: vi.fn(),
  mockToastError: vi.fn(),
  mockRouterPush: vi.fn(),
}))

vi.mock('@/app/explore/_actions/toggle-like', () => ({
  toggleLike: mockToggleLike,
}))
vi.mock('sonner', () => ({
  toast: { error: mockToastError, success: vi.fn() },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, refresh: vi.fn() }),
}))

import { LikeButton } from '../like-button'

const baseProps = {
  templateId: 'tpl-1',
  initialCount: 5,
  initialIsLiked: false,
  isAuthenticated: true,
}

describe('LikeButton', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the like count', () => {
    render(<LikeButton {...baseProps} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calls toggleLike when authenticated user clicks', async () => {
    mockToggleLike.mockResolvedValue({ liked: true })
    render(<LikeButton {...baseProps} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(mockToggleLike).toHaveBeenCalledWith('tpl-1'))
  })

  it('keeps incremented count after successful like', async () => {
    mockToggleLike.mockResolvedValue({ liked: true })
    render(<LikeButton {...baseProps} initialCount={5} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument())
  })

  it('links to sign-in when unauthenticated', () => {
    render(<LikeButton {...baseProps} isAuthenticated={false} />)

    const link = screen.getByRole('link', { name: 'Like' })
    expect(link).toHaveAttribute('href', '/login')
    expect(mockToggleLike).not.toHaveBeenCalled()
  })

  it('shows error toast and does not increment count on server error', async () => {
    mockToggleLike.mockRejectedValue(new Error('Server error'))
    render(<LikeButton {...baseProps} initialCount={5} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(mockToastError).toHaveBeenCalled())
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
