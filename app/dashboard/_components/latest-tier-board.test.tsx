import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { TierBoardPreview } from '@/lib/queries/tier-templates'
import { LatestTierBoard } from './latest-tier-board'

// eslint-disable-next-line anti-slop/no-module-mocking -- The stable react used by vitest lacks the canary ViewTransition export Next bundles.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  ViewTransition: ({ children }: { children: ReactNode }) => children,
}))

const tierList = {
  id: 'list-1',
  slug: 'list-1',
  title: 'Best sci-fi',
  category: 'movies',
  itemCount: 4,
  createdAt: new Date('2026-06-01T10:00:00Z'),
  isPublic: true,
}

const item = (n: number) => ({
  url: `https://x.public.blob.vercel-storage.com/${n}.png`,
  label: `Item ${n}`,
})

function board(overrides: Partial<TierBoardPreview> = {}): TierBoardPreview {
  return {
    templateId: 'list-1',
    rows: [
      { id: 's', label: 'S', color: '#f00', items: [item(1)], itemCount: 1 },
      { id: 'a', label: 'A', color: '#0f0', items: [], itemCount: 0 },
    ],
    bank: [item(2)],
    bankCount: 1,
    ...overrides,
  }
}

describe('LatestTierBoard', () => {
  it('offers to continue ranking and counts the bank when partially ranked', () => {
    render(<LatestTierBoard tierList={tierList} board={board()} />)

    expect(
      screen.getByRole('link', { name: /continue ranking/i })
    ).toHaveAttribute('href', '/dashboard/tier-lists/list-1')
    expect(screen.getByText(/of 2 items ranked/)).toBeInTheDocument()
    expect(screen.getByText(/1 waiting in the bank/)).toBeInTheDocument()
  })

  it('offers to start ranking when nothing is ranked yet', () => {
    render(
      <LatestTierBoard
        tierList={tierList}
        board={board({
          rows: [
            { id: 's', label: 'S', color: '#f00', items: [], itemCount: 0 },
          ],
          bank: [item(1), item(2)],
          bankCount: 2,
        })}
      />
    )

    expect(
      screen.getByRole('link', { name: /start ranking/i })
    ).toBeInTheDocument()
  })

  it('offers to open the list when the bank is empty', () => {
    render(
      <LatestTierBoard
        tierList={tierList}
        board={board({ bank: [], bankCount: 0 })}
      />
    )

    expect(
      screen.getByRole('link', { name: /open tier list/i })
    ).toBeInTheDocument()
    expect(screen.queryByText(/waiting in the bank/)).not.toBeInTheDocument()
  })

  it('totals ranked plus bank items regardless of the stored item count', () => {
    render(
      <LatestTierBoard
        tierList={{ ...tierList, itemCount: 1 }}
        board={board({ bankCount: 5 })}
      />
    )

    expect(screen.getByText(/of 6 items ranked/)).toBeInTheDocument()
  })

  it('shows how many items overflow a row', () => {
    render(
      <LatestTierBoard
        tierList={tierList}
        board={board({
          rows: [
            {
              id: 's',
              label: 'S',
              color: '#f00',
              items: [item(1)],
              itemCount: 4,
            },
          ],
        })}
      />
    )

    expect(screen.getByText('+3')).toBeInTheDocument()
  })
})
