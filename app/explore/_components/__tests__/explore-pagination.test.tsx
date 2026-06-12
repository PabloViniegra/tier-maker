import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExplorePagination } from '../explore-pagination'

const baseProps = {
  total: 36,
  page: 2,
  pageSize: 12,
  searchParams: { q: '', category: '', sort: 'newest' as const },
}

describe('ExplorePagination', () => {
  it('renders prev link on pages after the first', () => {
    render(<ExplorePagination {...baseProps} page={2} />)
    expect(screen.getByRole('link', { name: /prev/i })).toBeInTheDocument()
  })

  it('does not render a prev link on page 1', () => {
    render(<ExplorePagination {...baseProps} page={1} />)
    expect(
      screen.queryByRole('link', { name: /prev/i })
    ).not.toBeInTheDocument()
  })

  it('renders next link when not on last page', () => {
    render(<ExplorePagination {...baseProps} page={2} />)
    expect(screen.getByRole('link', { name: /next/i })).toBeInTheDocument()
  })

  it('does not render a next link on the last page', () => {
    // total=36, pageSize=12 → 3 pages; page=3 is last
    render(<ExplorePagination {...baseProps} page={3} />)
    expect(
      screen.queryByRole('link', { name: /next/i })
    ).not.toBeInTheDocument()
  })

  it('renders a link for each page number', () => {
    // total=36, pageSize=12 → 3 pages
    render(<ExplorePagination {...baseProps} />)
    expect(screen.getByRole('link', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Page 2' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Page 3' })).toBeInTheDocument()
  })

  it('prev link points to page - 1', () => {
    render(<ExplorePagination {...baseProps} page={3} />)
    const prev = screen.getByRole('link', { name: /prev/i })
    expect(prev).toHaveAttribute('href', expect.stringContaining('page=2'))
  })

  it('next link points to page + 1', () => {
    render(<ExplorePagination {...baseProps} page={1} />)
    const next = screen.getByRole('link', { name: /next/i })
    expect(next).toHaveAttribute('href', expect.stringContaining('page=2'))
  })

  it('renders nothing when total is 0', () => {
    const { container } = render(
      <ExplorePagination {...baseProps} total={0} page={1} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <ExplorePagination {...baseProps} total={5} pageSize={12} page={1} />
    )
    expect(container.firstChild).toBeNull()
  })
})
