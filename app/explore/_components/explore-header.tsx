import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { TierMakerIcon } from '@/components/tier-maker-icon'
import { cn } from '@/lib/utils'

type Props = {
  isLoggedIn: boolean
  isDetail?: boolean
}

export function ExploreHeader({ isLoggedIn, isDetail = false }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-base font-semibold text-foreground"
        >
          <TierMakerIcon size={18} aria-hidden="true" />
          <span translate="no">Tier Maker</span>
        </Link>

        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className={cn(
              buttonVariants({
                variant: isDetail ? 'ghost' : 'default',
                size: 'sm',
              })
            )}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
