import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { TierRowsBackground } from '@/components/tier-rows-background'

type CtaLink = { label: string; href: string; onClick?: never }
type CtaButton = { label: string; onClick: () => void; href?: never }
type Cta = CtaLink | CtaButton

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  cta?: Cta
  className?: string
}

/**
 * Shared empty-state component with miniature tier-rows motif background.
 * Supports optional single CTA as either a link or a button.
 *
 * CTA variants:
 * - `href` (CtaLink): rendered as a Next.js `<Link>` — RSC-safe, serializable.
 * - `onClick` (CtaButton): rendered as a `<button>` — requires a Client Component
 *   parent because functions are not serializable across the RSC boundary.
 */
export function EmptyState({ icon: Icon, title, description, cta, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-4 overflow-hidden rounded-lg border border-dashed border-border p-12 text-center',
        className,
      )}
    >
      {/* Decorative tier-rows motif */}
      <TierRowsBackground />

      {/* Content — raised above the background motif */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Icon size={32} strokeWidth={1} className="text-muted-foreground" />

        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base text-balance">{title}</h3>
          <p className="text-sm text-muted-foreground text-pretty">{description}</p>
        </div>

        {cta && (
          cta.href ? (
            <Link href={cta.href} className={cn(buttonVariants({ size: 'sm' }))}>
              {cta.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={cta.onClick}
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              {cta.label}
            </button>
          )
        )}
      </div>
    </div>
  )
}
