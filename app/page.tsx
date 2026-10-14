import type { Metadata } from 'next'
import Link from 'next/link'
import { TierMakerIcon } from '@/components/tier-maker-icon'
import { TierRowsBackground } from '@/components/tier-rows-background'
import { HeroDemo } from '@/components/hero-demo'
import { FadeUp } from '@/components/ui/fade-up'
import { SiteFooter } from '@/components/site-footer'
import { cn } from '@/lib/utils'
import { htmlSafeJson } from '@/lib/utils/html-safe-json'
import { STAGGER_DELAY, staggerIndex } from '@/lib/motion-variants'
import { buttonVariants } from '@/components/ui/button'

const HEADLINE = 'Drag your images into tiers.'
const SUBHEAD =
  'Rename or recolor any row, then share a link or export the board as a PNG.'

const FEATURES = [
  {
    title: 'Images up to 5 MB',
    body: 'JPG, PNG, WEBP or GIF, picked from disk, dropped in, or pasted from the clipboard. Up to 30 items per list.',
  },
  {
    title: 'Rows start at S to F',
    body: 'Add or remove rows, rename them, and pick any color for each one.',
  },
  {
    title: 'PNG export at 2× scale',
    body: 'The exported image shows the tiers and items, without buttons or the item bank.',
  },
] as const

export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    title: `Tier Maker — ${HEADLINE}`,
    description: SUBHEAD,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Tier Maker — ${HEADLINE}`,
    description: SUBHEAD,
  },
}

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://tiermaker.pabloviniegra.dev'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Tier Maker',
  url: baseUrl,
}

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: htmlSafeJson(websiteJsonLd) }}
      />
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <TierMakerIcon size={18} aria-hidden="true" />
            <span
              className="font-heading text-base font-semibold text-foreground"
              translate="no"
            >
              Tier Maker
            </span>
          </div>
          <nav aria-label="Main" className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8"
      >
        <section className="relative overflow-hidden rounded-xl border border-border bg-card">
          <TierRowsBackground />
          <div className="relative grid grid-cols-1 gap-8 p-7 lg:grid-cols-2 lg:items-center lg:p-10">
            <div className="flex flex-col justify-center">
              <FadeUp delay={0}>
                <h1 className="font-heading text-4xl leading-[1.15] font-semibold tracking-tight text-balance text-foreground lg:text-5xl">
                  {HEADLINE}
                </h1>
              </FadeUp>
              <FadeUp delay={0.06}>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
                  {SUBHEAD}
                </p>
              </FadeUp>
              <FadeUp delay={0.12} className="mt-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/register"
                    className={cn(buttonVariants({ size: 'default' }))}
                  >
                    Get started
                  </Link>
                  <Link
                    href="/explore"
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'default' })
                    )}
                  >
                    Browse tier lists
                  </Link>
                </div>
              </FadeUp>
            </div>

            <FadeUp delay={0.18} className="w-full">
              <div className="rounded-lg border border-border bg-surface p-4">
                <HeroDemo />
              </div>
            </FadeUp>
          </div>
        </section>

        <section
          aria-label="What you can do"
          className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3"
        >
          {FEATURES.map(({ title, body }, i) => (
            <FadeUp key={title} delay={staggerIndex(i) * STAGGER_DELAY}>
              <h2 className="font-heading text-sm font-semibold text-foreground">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">
                {body}
              </p>
            </FadeUp>
          ))}
        </section>

        <FadeUp className="mt-10 flex flex-col items-start gap-3 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Other people&apos;s public lists are on Explore. You can fill one
            in and export it without an account.
          </p>
          <Link
            href="/explore"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'shrink-0'
            )}
          >
            Open Explore
          </Link>
        </FadeUp>
      </main>

      <SiteFooter />
    </div>
  )
}
