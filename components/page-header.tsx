import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface PageHeaderProps {
  backHref: string
  title: string
  /** Actions slot — rendered at the trailing end of the header */
  children?: ReactNode
  className?: string
}

/**
 * Shared page header for creator/editor pages.
 * Provides: back link, h1 title, and an optional trailing actions slot.
 * Pinning (sticky/fixed) is handled by the parent layout via flex column; this
 * component does not apply a sticky class itself.
 */
export function PageHeader({
  backHref,
  title,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-11 shrink-0 gap-1.5 text-muted-foreground hover:text-foreground'
          )}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back
        </Link>
        <h1 className="line-clamp-1 font-heading text-lg">{title}</h1>
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-3">{children}</div>
      )}
    </header>
  )
}
