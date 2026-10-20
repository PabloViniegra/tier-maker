import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { authClient } from '@/lib/auth-client'
import { mockReplace } from '@/lib/__mocks__/next-navigation'
import { asMock } from '@/test/as-mock'

import { ProfileDeleteDialog } from './profile-delete-dialog'

function renderDialog(
  props: Partial<ComponentProps<typeof ProfileDeleteDialog>> = {}
) {
  return render(
    <ProfileDeleteDialog
      name="Pablo García"
      created={3}
      published={1}
      likesReceived={5}
      {...props}
    />
  )
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /delete account/i }))
}

async function goToConfirmStep(user: ReturnType<typeof userEvent.setup>) {
  await openDialog(user)
  await user.click(screen.getByRole('button', { name: /continue/i }))
  await screen.findByRole('textbox', { name: /display name|confirmation/i })
}

describe('ProfileDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    asMock(authClient.deleteUser).mockResolvedValue({ data: {}, error: null })
  })

  it('opens on the review step without the name field', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openDialog(user)

    expect(
      screen.queryByRole('textbox', { name: /display name/i })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
    expect(screen.getByRole('alertdialog')).toHaveClass(
      'duration-200',
      'ease-[cubic-bezier(0.16,1,0.3,1)]'
    )
  })

  it('lists what will be deleted with counts and an export pointer', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openDialog(user)

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent(
      '3 lists, including 1 public list that will disappear from Explore'
    )
    expect(dialog).toHaveTextContent('5 likes your lists received')
    expect(dialog).toHaveTextContent('Your saved presets')
    expect(
      screen.getByRole('link', { name: /go to your lists/i })
    ).toHaveAttribute('href', '/dashboard/tier-lists')
  })

  it('uses the singular and omits empty counts for a single private list', async () => {
    const user = userEvent.setup()
    renderDialog({ created: 1, published: 0, likesReceived: 0 })

    await openDialog(user)

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent(/1 list(?!s)/)
    expect(dialog).not.toHaveTextContent('public list')
    expect(dialog).not.toHaveTextContent('likes your lists received')
    expect(
      screen.getByRole('link', { name: /go to your lists/i })
    ).toBeInTheDocument()
  })

  it('shows no list, like, or export lines for an account without lists', async () => {
    const user = userEvent.setup()
    renderDialog({ created: 0, published: 0, likesReceived: 0 })

    await openDialog(user)

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Your saved presets')
    expect(
      screen.queryByRole('link', { name: /go to your lists/i })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('alertdialog')).not.toHaveTextContent(/\d+ lists?/)
  })

  it('closes from the review cancel', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openDialog(user)
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(
      screen.queryByRole('button', { name: /continue/i })
    ).not.toBeInTheDocument()
  })

  it('advances to the name field after continue', async () => {
    const user = userEvent.setup()
    renderDialog()

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
    renderDialog()

    await goToConfirmStep(user)
    const submit = screen.getByRole('button', { name: /^delete my account$/i })
    expect(submit).toBeDisabled()

    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Wrong Name'
    )
    expect(submit).toBeDisabled()
  })

  it('returns to review when back is pressed without deleting', async () => {
    const user = userEvent.setup()
    renderDialog()

    await goToConfirmStep(user)
    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Pablo García'
    )
    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(authClient.deleteUser).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', { name: /display name/i })
      ).not.toBeInTheDocument()
    })
    expect(
      await screen.findByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })

  it('deletes the account after typing the display name', async () => {
    const user = userEvent.setup()
    renderDialog()

    await goToConfirmStep(user)
    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Pablo García'
    )
    await user.click(
      screen.getByRole('button', { name: /^delete my account$/i })
    )

    await waitFor(() => {
      expect(authClient.deleteUser).toHaveBeenCalled()
    })
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('keeps the dialog open and exposes a retry after deletion fails', async () => {
    asMock(authClient.deleteUser)
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Account deletion is temporarily unavailable.' },
      })
      .mockResolvedValue({ data: {}, error: null })
    const user = userEvent.setup()
    renderDialog()

    await goToConfirmStep(user)
    await user.type(
      screen.getByRole('textbox', { name: /display name/i }),
      'Pablo García'
    )
    await user.click(
      screen.getByRole('button', { name: /^delete my account$/i })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /temporarily unavailable/i
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /^delete my account$/i })
    )

    await waitFor(() => {
      expect(authClient.deleteUser).toHaveBeenCalledTimes(2)
      expect(mockReplace).toHaveBeenCalledWith('/')
    })
  })

  it('requires an explicit DELETE token when the display name is empty', async () => {
    const user = userEvent.setup()
    renderDialog({ name: '', created: 0, published: 0, likesReceived: 0 })

    await goToConfirmStep(user)

    await screen.findByRole('textbox', { name: /confirmation/i })
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      /type DELETE to permanently delete your account/i
    )
    const input = await screen.findByRole('textbox', { name: /confirmation/i })
    const submit = screen.getByRole('button', { name: /^delete my account$/i })

    expect(submit).toBeDisabled()
    await user.type(input, 'DELETE')
    expect(submit).toBeEnabled()
  })
})
