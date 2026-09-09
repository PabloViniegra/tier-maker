import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { authClient } from '@/lib/auth-client'
import { mockReplace } from '@/lib/__mocks__/next-navigation'
import { asMock } from '@/test/as-mock'

import { ProfileDeleteDialog } from './profile-delete-dialog'

describe('ProfileDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    asMock(authClient.deleteUser).mockResolvedValue({ data: {}, error: null })
  })

  it('keeps continue disabled until the display name matches', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await user.click(screen.getByRole('button', { name: /delete account/i }))
    const confirm = screen.getByRole('button', { name: /continue/i })
    expect(confirm).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: /display name/i }), 'Wrong Name')
    expect(confirm).toBeDisabled()
  })

  it('does not delete when the nested alert is cancelled', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await user.click(screen.getByRole('button', { name: /delete account/i }))
    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Pablo García'
    )
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(authClient.deleteUser).not.toHaveBeenCalled()
    expect(
      screen.getByRole('textbox', { name: /display name/i })
    ).toBeInTheDocument()
  })

  it('deletes the account after destructive confirm', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await user.click(screen.getByRole('button', { name: /delete account/i }))
    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Pablo García'
    )
    await user.click(screen.getByRole('button', { name: /continue/i }))
    const deleteButtons = screen.getAllByRole('button', {
      name: /^delete account$/i,
    })
    await user.click(deleteButtons[deleteButtons.length - 1])

    await waitFor(() => {
      expect(authClient.deleteUser).toHaveBeenCalled()
    })
    expect(mockReplace).toHaveBeenCalledWith('/')
  })
})
