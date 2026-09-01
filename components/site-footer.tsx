import Link from 'next/link'

import { TierMakerIcon } from '@/components/tier-maker-icon'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 md:gap-10 md:py-12">
        <div>
          <div className="flex items-center gap-2">
            <TierMakerIcon size={18} aria-hidden="true" />
            <span
              className="font-heading text-sm font-semibold text-foreground"
              translate="no"
            >
              Tier Maker
            </span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Build, rank, and share tier lists for anything. Movies, games,
            albums&mdash;drag, drop, and share with one link.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Navigate
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/explore"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Get started
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Legal
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/terms"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <p>&copy; {year} Tier Maker. All rights reserved.</p>
          <p>Made for ranking things you love.</p>
        </div>
      </div>
    </footer>
  )
}
