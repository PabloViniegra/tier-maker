import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import * as deleteAction from '@/app/dashboard/tier-lists/_actions/delete-tier-list'
import { TierListCard } from './tier-list-card'
import { asMock } from '@/test/as-mock'

const baseProps = {
  id: 'abc-123',
  slug: 'my-anime-rankings',
  title: 'My Anime Rankings',
  category: 'anime',
  itemCount: 23,
  createdAt: new Date('2026-06-01T10:00:00Z'),
  isPublic: true,
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /options/i }))
  await screen.findByRole('menuitem', { name: /delete/i })
}

describe('TierListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(deleteAction, 'deleteTierList').mockResolvedValue({ ok: true })
  })

  it('renders the title', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByText('My Anime Rankings')).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByText('anime')).toBeInTheDocument()
  })

  it('renders the item count', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByText('23 items')).toBeInTheDocument()
  })

  it('renders "1 item" (singular) when itemCount is 1', () => {
    render(<TierListCard {...baseProps} itemCount={1} />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('renders "0 items" when itemCount is 0', () => {
    render(<TierListCard {...baseProps} itemCount={0} />)
    expect(screen.getByText('0 items')).toBeInTheDocument()
  })

  it('renders an Open button', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByRole('link', { name: /open/i })).toBeInTheDocument()
  })

  it('Open button links to the tier list detail route', () => {
    render(<TierListCard {...baseProps} />)
    const link = screen.getByRole('link', { name: /open/i })
    expect(link).toHaveAttribute('href', '/dashboard/tier-lists/abc-123')
  })

  it('truncates long category names in the badge', () => {
    render(
      <TierListCard
        {...baseProps}
        category="this-is-a-very-long-category-name-that-exceeds-limit"
      />
    )
    expect(screen.getByText(/this-is-a-very-long/)).toBeInTheDocument()
  })

  it('renders the cover image when coverImageUrl is provided', () => {
    const { container } = render(
      <TierListCard {...baseProps} coverImageUrl="https://blob/cover.png" />
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
  })

  it('renders the first item image as fallback when no cover but firstItemUrl exists', () => {
    const { container } = render(
      <TierListCard {...baseProps} firstItemUrl="https://blob/item.png" />
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://blob/item.png')
  })

  it('cover image takes precedence over firstItemUrl', () => {
    const { container } = render(
      <TierListCard
        {...baseProps}
        coverImageUrl="https://blob/cover.png"
        firstItemUrl="https://blob/item.png"
      />
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
  })

  it('marks the cover image decorative so screen readers do not repeat the title', () => {
    const { container } = render(
      <TierListCard {...baseProps} coverImageUrl="https://blob/cover.png" />
    )
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('shows a Private badge when the tier list is not public', () => {
    render(<TierListCard {...baseProps} isPublic={false} />)
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('does not show a Private badge when the tier list is public', () => {
    render(<TierListCard {...baseProps} isPublic={true} />)
    expect(screen.queryByText('Private')).not.toBeInTheDocument()
  })

  it('Copy link copies the public explore URL for public tier lists', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<TierListCard {...baseProps} isPublic={true} />)
    await openMenu(user)
    await user.click(screen.getByText('Copy link'))
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/explore/my-anime-rankings`
    )
    expect(toast.success).toHaveBeenCalledWith('Link copied')
  })

  it('Copy link copies the editor URL for private tier lists', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<TierListCard {...baseProps} isPublic={false} />)
    await openMenu(user)
    await user.click(screen.getByText('Copy link'))
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/dashboard/tier-lists/abc-123/edit`
    )
    expect(toast.info).toHaveBeenCalledWith(
      'Private tier list — editor link copied'
    )
  })

  it('shows an error when copying the link fails', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockRejectedValue(new Error('Not allowed'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<TierListCard {...baseProps} isPublic={true} />)
    await openMenu(user)
    await user.click(screen.getByText('Copy link'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not copy link. Try again.'
      )
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('shows a placeholder with title initials when neither cover nor firstItemUrl is set', () => {
    render(<TierListCard {...baseProps} />)
    const placeholder = screen.getByTestId('card-cover-placeholder')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveTextContent('MA')
  })

  it('renders a context menu trigger button', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByRole('button', { name: /options/i })).toBeInTheDocument()
  })

  it('renders "Edit" link in the card menu', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    expect(screen.getByRole('link', { name: /^edit$/i })).toBeInTheDocument()
  })

  it('"Edit" links to the edit route', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    const editLink = screen.getByRole('link', { name: /^edit$/i })
    expect(editLink).toHaveAttribute(
      'href',
      '/dashboard/tier-lists/abc-123/edit'
    )
  })

  it('renders "Delete" option in the card menu', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('clicking "Delete" opens a confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    await user.click(screen.getByText('Delete'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('confirmation dialog displays the tier list title', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    await user.click(screen.getByText('Delete'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('My Anime Rankings')).toBeInTheDocument()
  })

  it('Cancel button dismisses the confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    await user.click(screen.getByText('Delete'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByText('Cancel'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('Delete button calls deleteTierList with the correct id and closes the dialog', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    await user.click(screen.getByText('Delete'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))
    await waitFor(() => {
      expect(deleteAction.deleteTierList).toHaveBeenCalledWith('abc-123')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('disables Delete and Cancel buttons while deletion is pending', async () => {
    let resolveDelete: (value: { ok: true }) => void = () => undefined
    const deferredDelete = new Promise<{ ok: true }>((resolve) => {
      resolveDelete = resolve
    })
    asMock(deleteAction.deleteTierList).mockReturnValueOnce(deferredDelete)

    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    await user.click(screen.getByText('Delete'))
    const dialog = await screen.findByRole('dialog')
    const confirmDeleteButton = within(dialog).getByRole('button', {
      name: /^delete$/i,
    })
    await user.click(confirmDeleteButton)

    await waitFor(() => {
      expect(confirmDeleteButton).toBeDisabled()
      expect(within(dialog).getByText('Cancel')).toBeDisabled()
    })

    resolveDelete({ ok: true })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows a success toast after successful deletion', async () => {
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    await user.click(screen.getByText('Delete'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Tier list deleted')
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows an error toast and keeps dialog open on deletion failure', async () => {
    asMock(deleteAction.deleteTierList).mockRejectedValue(
      new Error('Database error')
    )
    const user = userEvent.setup()
    render(<TierListCard {...baseProps} />)
    await openMenu(user)
    await user.click(screen.getByText('Delete'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete tier list')
    })
    expect(toast.success).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
