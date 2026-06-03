import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  isLoggedIn: boolean
}

export function ExploreHeader({ isLoggedIn }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-heading text-base font-semibold text-foreground"
        >
          Tier Maker
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
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
