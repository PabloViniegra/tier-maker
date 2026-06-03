import Link from 'next/link'
import { cn } from '@/lib/utils'

type SearchParams = {
  q?: string
  category?: string
  sort?: string
}

type Props = {
  total: number
  page: number
  pageSize: number
  searchParams: SearchParams
}

function buildPageUrl(searchParams: SearchParams, page: number): string {
  const params = new URLSearchParams()
  if (searchParams.q) params.set('q', searchParams.q)
  if (searchParams.category) params.set('category', searchParams.category)
  if (searchParams.sort) params.set('sort', searchParams.sort)
  params.set('page', String(page))
  return `?${params.toString()}`
}

export function ExplorePagination({ total, page, pageSize, searchParams }: Props) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const isFirst = page === 1
  const isLast = page === totalPages

  const linkClass = cn(
    'flex h-8 min-w-8 items-center justify-center rounded-md border border-border px-2 text-xs font-medium text-foreground',
    'transition-colors hover:border-primary/30 hover:bg-overlay'
  )
  const activeLinkClass = 'border-primary bg-primary/10 text-primary'

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 py-6"
    >
      {!isFirst && (
        <Link
          href={buildPageUrl(searchParams, page - 1)}
          aria-label="prev"
          className={linkClass}
        >
          Prev
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildPageUrl(searchParams, p)}
          aria-label={String(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(linkClass, p === page && activeLinkClass)}
        >
          {p}
        </Link>
      ))}

      {!isLast && (
        <Link
          href={buildPageUrl(searchParams, page + 1)}
          aria-label="next"
          className={linkClass}
        >
          Next
        </Link>
      )}
    </nav>
  )
}
