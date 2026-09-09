import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import * as navigation from 'next/navigation'

import { asMock } from '@/test/as-mock'
import { TierListsBrowser } from './tier-lists-browser'

const tierLists = [
  {
    id: 'tier-1',
    slug: 'anime',
    title: 'Anime rankings',
    category: 'Anime',
    itemCount: 3,
    createdAt: '2026-09-01T00:00:00.000Z',
    isPublic: true,
  },
]

describe('TierListsBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    asMock(navigation.usePathname).mockReturnValue('/dashboard/tier-lists')
    asMock(navigation.useSearchParams).mockReturnValue(new URLSearchParams())
  })

  it('restores the search query from the URL', () => {
    asMock(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('q=anime')
    )

    render(<TierListsBrowser tierLists={tierLists} />)

    expect(screen.getByRole('searchbox')).toHaveValue('anime')
  })

  it('writes the search query to the URL without dropping other parameters', () => {
    asMock(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('view=grid')
    )

    render(<TierListsBrowser tierLists={tierLists} />)
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'anime' },
    })

    expect(navigation.useRouter().replace).toHaveBeenCalledWith(
      '/dashboard/tier-lists?view=grid&q=anime',
      { scroll: false }
    )
  })
})
