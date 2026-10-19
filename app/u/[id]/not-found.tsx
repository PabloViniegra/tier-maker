import Link from 'next/link'
import { getSession } from '@/lib/session'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExploreHeader } from '@/app/explore/_components/explore-header'

export default async function ProfileNotFound() {
  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ExploreHeader isLoggedIn={!!session} isDetail />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-3 px-4 py-16"
      >
        <h1 className="font-heading text-2xl font-semibold text-balance text-foreground">
          No public tier lists here
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          This creator doesn&apos;t exist, has no public tier lists, or this
          page is past their last one.
        </p>
        <Link
          href="/explore"
          className={cn(buttonVariants({ size: 'sm' }), 'mt-2')}
        >
          Browse Explore
        </Link>
      </main>
    </div>
  )
}
