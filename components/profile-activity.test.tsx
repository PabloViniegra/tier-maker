import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ProfileActivity } from './profile-activity'
import type { ProfileStats } from '@/lib/queries/tier-templates'

const emptyStats: ProfileStats = {
  created: 0,
  published: 0,
  likesReceived: 0,
  createdSeries: new Array(14).fill(0),
  publishedSeries: new Array(14).fill(0),
}

describe('ProfileActivity', () => {
  it('shows empty copy when the user has no lists', () => {
    render(<ProfileActivity stats={emptyStats} />)

    expect(screen.getByText(/no lists yet/i)).toBeInTheDocument()
    expect(screen.queryByText('Created')).not.toBeInTheDocument()
  })

  it('offers a create link when the user has no lists', () => {
    render(<ProfileActivity stats={emptyStats} />)

    expect(
      screen.getByRole('link', { name: /create tier list/i })
    ).toHaveAttribute('href', '/dashboard/tier-lists/new')
  })

  it('renders created, published, and likes totals', () => {
    render(
      <ProfileActivity
        stats={{
          created: 4,
          published: 2,
          likesReceived: 9,
          createdSeries: [0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          publishedSeries: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        }}
      />
    )

    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Likes')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })
})
