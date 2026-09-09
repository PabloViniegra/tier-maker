import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { authClient } from '@/lib/auth-client'
import { mockReplace } from '@/lib/__mocks__/next-navigation'
import { asMock } from '@/test/as-mock'

import { ProfileDeleteDialog } from './profile-delete-dialog'

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /delete account/i }))
}

async function goToConfirmStep(user: ReturnType<typeof userEvent.setup>) {
  await openDialog(user)
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

describe('ProfileDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    asMock(authClient.deleteUser).mockResolvedValue({ data: {}, error: null })
  })

  it('opens on the review step without the name field', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await openDialog(user)

    expect(
      screen.queryByRole('textbox', { name: /display name/i })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('closes from the review cancel', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await openDialog(user)
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(
      screen.queryByRole('button', { name: /continue/i })
    ).not.toBeInTheDocument()
  })

  it('advances to the name field after continue', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await goToConfirmStep(user)

    expect(
      screen.getByRole('textbox', { name: /display name/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /continue/i })
    ).not.toBeInTheDocument()
  })

  it('keeps delete disabled until the display name matches', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await goToConfirmStep(user)
    const submit = screen.getByRole('button', { name: /^delete account$/i })
    expect(submit).toBeDisabled()

    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Wrong Name'
    )
    expect(submit).toBeDisabled()
  })

  it('returns to review when back is pressed without deleting', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await goToConfirmStep(user)
    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Pablo García'
    )
    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(authClient.deleteUser).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('textbox', { name: /display name/i })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('deletes the account after typing the display name', async () => {
    const user = userEvent.setup()
    render(<ProfileDeleteDialog name="Pablo García" />)

    await goToConfirmStep(user)
    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Pablo García'
    )
    await user.click(
      screen.getByRole('button', { name: /^delete account$/i })
    )

    await waitFor(() => {
      expect(authClient.deleteUser).toHaveBeenCalled()
    })
    expect(mockReplace).toHaveBeenCalledWith('/')
  })
})
