import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as navigation from 'next/navigation'
import { ExploreSearchInput } from '../explore-search-input'
import { asMock } from '@/test/as-mock'

describe('ExploreSearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    asMock(navigation.useSearchParams).mockReturnValue(new URLSearchParams())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a search input', () => {
    render(<ExploreSearchInput defaultValue="" />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('does not call router.push immediately on change', () => {
    render(<ExploreSearchInput defaultValue="" />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'a' } })
    expect(navigation.useRouter().push).not.toHaveBeenCalled()
  })

  it('calls router.push with ?q= after 400ms debounce', () => {
    render(<ExploreSearchInput defaultValue="" />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'anime' } })
    vi.advanceTimersByTime(400)
    expect(navigation.useRouter().push).toHaveBeenCalledOnce()
    expect(navigation.useRouter().push).toHaveBeenCalledWith(
      expect.stringContaining('q=anime')
    )
  })

  it('resets page to 1 when search changes', () => {
    asMock(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('page=3&sort=newest')
    )
    render(<ExploreSearchInput defaultValue="" />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'x' } })
    vi.advanceTimersByTime(400)
    const url = asMock(navigation.useRouter().push).mock.calls[0][0]
    expect(url).toContain('page=1')
  })

  it('preserves existing sort and category params', () => {
    asMock(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('sort=oldest&category=Anime&page=2')
    )
    render(<ExploreSearchInput defaultValue="" />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'dragon' } })
    vi.advanceTimersByTime(400)
    const url = asMock(navigation.useRouter().push).mock.calls[0][0]
    expect(url).toContain('sort=oldest')
    expect(url).toContain('category=Anime')
  })

  it('does not fire a second push if another change arrives before 400ms', () => {
    render(<ExploreSearchInput defaultValue="" />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'a' } })
    vi.advanceTimersByTime(200)
    fireEvent.change(input, { target: { value: 'ab' } })
    vi.advanceTimersByTime(400)
    expect(navigation.useRouter().push).toHaveBeenCalledOnce()
  })
})
