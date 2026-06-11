import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

const { mockDeleteTierList, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockDeleteTierList: vi.fn().mockResolvedValue({ ok: true }),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; fill?: boolean; sizes?: string } & React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button type="button" {...props}>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, ...props }: { children: React.ReactNode; onSelect?: () => void } & React.HTMLAttributes<HTMLDivElement>) => (
    <div onClick={onSelect} {...props}>{children}</div>
  ),
}))

// Captured onOpenChange for testing dialog-close guard during pending
let capturedOnOpenChange: ((open: boolean) => void) | undefined

vi.mock('@/components/ui/dialog', () => {
  const DialogCtx = React.createContext<{ onOpenChange?: (open: boolean) => void }>({})

  return {
    Dialog: ({ open, onOpenChange, children, ...props }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode; [key: string]: unknown }) => {
      capturedOnOpenChange = onOpenChange
      return React.createElement(DialogCtx.Provider, { value: { onOpenChange } },
        open ? React.createElement('div', { 'data-testid': 'delete-dialog', ...props }, children) : null
      )
    },
    DialogContent: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props, children),
    DialogHeader: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props, children),
    DialogTitle: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('h2', props, children),
    DialogDescription: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('p', props, children),
    DialogFooter: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props, children),
    DialogClose: ({ render, ...props }: { render?: React.ReactElement<Record<string, unknown>>; [key: string]: unknown }) => {
      const { onOpenChange } = React.useContext(DialogCtx)
      if (render) {
        const renderProps = (render.props ?? {}) as Record<string, unknown>
        return React.cloneElement(render, {
          ...renderProps,
          ...props,
          onClick: (e: React.MouseEvent) => {
            const existingOnClick = renderProps.onClick
            if (typeof existingOnClick === 'function') {
              existingOnClick(e)
            }
            onOpenChange?.(false)
          },
        })
      }
      return null
    },
  }
})

vi.mock('@/app/dashboard/tier-lists/_actions/delete-tier-list', () => ({
  deleteTierList: mockDeleteTierList,
}))

import { TierListCard } from './tier-list-card'

const baseProps = {
  id: 'abc-123',
  title: 'My Anime Rankings',
  category: 'anime',
  itemCount: 23,
  createdAt: new Date('2026-06-01T10:00:00Z'),
}

describe('TierListCard', () => {
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
    render(<TierListCard {...baseProps} coverImageUrl="https://blob/cover.png" />)
    const img = screen.getByRole('img', { name: /my anime rankings/i })
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
  })

  it('renders the first item image as fallback when no cover but firstItemUrl exists', () => {
    render(<TierListCard {...baseProps} firstItemUrl="https://blob/item.png" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://blob/item.png')
  })

  it('cover image takes precedence over firstItemUrl', () => {
    render(
      <TierListCard
        {...baseProps}
        coverImageUrl="https://blob/cover.png"
        firstItemUrl="https://blob/item.png"
      />
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://blob/cover.png')
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

  it('renders "Edit" link in the card menu', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByRole('link', { name: /^edit$/i })).toBeInTheDocument()
  })

  it('"Edit" links to the edit route', () => {
    render(<TierListCard {...baseProps} />)
    const editLink = screen.getByRole('link', { name: /^edit$/i })
    expect(editLink).toHaveAttribute('href', '/dashboard/tier-lists/abc-123/edit')
  })

  it('renders "Delete" option in the card menu', () => {
    render(<TierListCard {...baseProps} />)
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('clicking "Delete" opens a confirmation dialog', async () => {
    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })
  })

  it('confirmation dialog displays the tier list title', async () => {
    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      const dialog = screen.getByTestId('delete-dialog')
      expect(within(dialog).getByText('My Anime Rankings')).toBeInTheDocument()
    })
  })

  it('Cancel button dismisses the confirmation dialog', async () => {
    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
    })
  })

  it('Delete button calls deleteTierList with the correct id and closes the dialog', async () => {
    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })
    const deleteButtons = screen.getAllByText('Delete')
    const confirmDeleteButton = deleteButtons.find(
      (el) => el.closest('[data-testid="delete-dialog"]')
    )
    expect(confirmDeleteButton).toBeTruthy()
    fireEvent.click(confirmDeleteButton!)
    await waitFor(() => {
      expect(mockDeleteTierList).toHaveBeenCalledWith('abc-123')
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
    })
  })

  it('disables Delete and Cancel buttons while deletion is pending', async () => {
    let resolveDelete: (value: { ok: true }) => void
    const deferredDelete = new Promise<{ ok: true }>((resolve) => {
      resolveDelete = resolve
    })
    mockDeleteTierList.mockReturnValueOnce(deferredDelete)

    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    const confirmDeleteButton = deleteButtons.find(
      (el) => el.closest('[data-testid="delete-dialog"]')
    )
    fireEvent.click(confirmDeleteButton!)

    // Both buttons should be disabled during pending
    await waitFor(() => {
      expect(confirmDeleteButton!).toBeDisabled()
      expect(screen.getByText('Cancel')).toBeDisabled()
    })

    // Resolve the deferred promise and wait for cleanup
    resolveDelete!({ ok: true })
    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
    })
  })

  it('prevents dialog from closing via outside click while deletion is pending', async () => {
    let resolveDelete: (value: { ok: true }) => void
    const deferredDelete = new Promise<{ ok: true }>((resolve) => {
      resolveDelete = resolve
    })
    mockDeleteTierList.mockReturnValueOnce(deferredDelete)

    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    const confirmDeleteButton = deleteButtons.find(
      (el) => el.closest('[data-testid="delete-dialog"]')
    )
    fireEvent.click(confirmDeleteButton!)

    // Simulate outside click (escape or backdrop click) while pending
    capturedOnOpenChange!(false)

    // Dialog should still be open — the guard prevented closure
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()

    // Resolve to clean up
    resolveDelete!({ ok: true })
    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
    })
  })

  it('shows a success toast after successful deletion', async () => {
    mockDeleteTierList.mockResolvedValue({ ok: true })
    mockToastSuccess.mockClear()
    mockToastError.mockClear()

    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    const confirmDeleteButton = deleteButtons.find(
      (el) => el.closest('[data-testid="delete-dialog"]')
    )
    fireEvent.click(confirmDeleteButton!)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Tier list deleted')
    })
    expect(mockToastError).not.toHaveBeenCalled()
  })

  it('shows an error toast and keeps dialog open on deletion failure', async () => {
    mockDeleteTierList.mockRejectedValue(new Error('Database error'))
    mockToastSuccess.mockClear()
    mockToastError.mockClear()

    render(<TierListCard {...baseProps} />)
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    const confirmDeleteButton = deleteButtons.find(
      (el) => el.closest('[data-testid="delete-dialog"]')
    )
    fireEvent.click(confirmDeleteButton!)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to delete tier list')
    })
    expect(mockToastSuccess).not.toHaveBeenCalled()
    // Dialog should remain open
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
  })
})
