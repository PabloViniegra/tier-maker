import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { ShareButton } from './share-button'
import { TooltipProvider } from './ui/tooltip'

type ShareNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>
  clipboard?: { writeText: (text: string) => Promise<void> }
}

function stubNavigator({
  share,
  writeText,
}: {
  share?: ShareNavigator['share']
  writeText: ShareNavigator['clipboard']['writeText']
}) {
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: share,
  })
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
}

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
  })

  it('uses Web Share with the absolute public URL when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    stubNavigator({ share, writeText })

    render(
      <ShareButton
        title="My rankings"
        text="A list of favorites"
        url="/explore/my-rankings"
      />
    )

    await user.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() => {
      expect(share).toHaveBeenCalledWith({
        title: 'My rankings',
        text: 'A list of favorites',
        url: `${window.location.origin}/explore/my-rankings`,
      })
    })
    expect(writeText).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Link shared')
  })

  it('activates sharing from the keyboard', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    stubNavigator({ share, writeText })

    render(<ShareButton title="My rankings" url="/explore/my-rankings" />)

    const button = screen.getByRole('button', { name: /share/i })
    button.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(share).toHaveBeenCalled()
    })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('keeps the share label accessible when rendered as an icon-only action', () => {
    render(
      <ShareButton title="My rankings" url="/explore/my-rankings" iconOnly />
    )

    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
    expect(screen.getByText('Share')).toHaveClass('sr-only')
  })

  it('shows the action label when the icon-only control receives focus', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <ShareButton
          title="My rankings"
          url="/explore/my-rankings"
          iconOnly
          showTooltip
        />
      </TooltipProvider>
    )

    await user.tab()

    expect(
      await screen.findByRole('tooltip', { name: 'Share' })
    ).toBeInTheDocument()
  })

  it('copies the absolute public URL when Web Share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    stubNavigator({ writeText })

    render(<ShareButton title="My rankings" url="/explore/my-rankings" />)

    await user.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/explore/my-rankings`
      )
    })
    expect(toast.success).toHaveBeenCalledWith('Link copied')
  })

  it('does not copy or show an error when native sharing is cancelled', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException('Share cancelled', 'AbortError'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    stubNavigator({ share, writeText })

    render(<ShareButton title="My rankings" url="/explore/my-rankings" />)

    await user.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /share/i })).toBeEnabled()
    })
    expect(writeText).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('falls back to copying when native sharing fails', async () => {
    const share = vi.fn().mockRejectedValue(new Error('Share unavailable'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    stubNavigator({ share, writeText })

    render(<ShareButton title="My rankings" url="/explore/my-rankings" />)

    await user.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/explore/my-rankings`
      )
    })
    expect(toast.success).toHaveBeenCalledWith('Link copied')
  })

  it('shows an error when both sharing mechanisms fail', async () => {
    const share = vi.fn().mockRejectedValue(new Error('Share unavailable'))
    const writeText = vi.fn().mockRejectedValue(new Error('Not allowed'))
    const user = userEvent.setup()
    stubNavigator({ share, writeText })

    render(<ShareButton title="My rankings" url="/explore/my-rankings" />)

    await user.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not share link. Try again.'
      )
    })
    expect(share).toHaveBeenCalled()
    expect(writeText).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /share/i })).toBeEnabled()
  })

  it('disables the button while sharing is pending', async () => {
    let resolveShare!: () => void
    const share = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveShare = resolve
        })
    )
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    stubNavigator({ share, writeText })

    render(<ShareButton title="My rankings" url="/explore/my-rankings" />)

    const button = screen.getByRole('button', { name: /share/i })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    resolveShare()

    await waitFor(() => {
      expect(button).toBeEnabled()
    })
  })
})
