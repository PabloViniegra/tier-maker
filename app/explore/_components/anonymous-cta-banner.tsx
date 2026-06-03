import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AnonymousCTABanner() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-primary/20 bg-primary/5 px-4 py-2.5">
      <p className="text-xs text-muted-foreground">
        Your changes are not saved.{' '}
        <span className="text-foreground">Sign in to save your result.</span>
      </p>
      <Link
        href="/login"
        className={cn(buttonVariants({ size: 'sm' }), 'h-7 shrink-0 text-xs')}
      >
        Sign in
      </Link>
    </div>
  )
}
