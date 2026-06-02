'use client'

import Link from 'next/link'
import { useCallback, useRef } from 'react'
import { MousePointerClick, Link2, Layers } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { BentoGrid, BentoCell } from '@/components/bento-grid'
import { TierRowsBackground } from '@/components/tier-rows-background'
import { TierListMockup } from '@/components/tier-list-mockup'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--spotlight-x', `${x}px`)
    e.currentTarget.style.setProperty('--spotlight-y', `${y}px`)
  }, [])

  return (
    <div className='min-h-[100dvh] bg-background'>
      {/* Minimal nav */}
      <header className='sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6'>
          <span className='font-heading text-base font-semibold text-foreground'>
            Tier Maker
          </span>
          <nav className='flex items-center gap-2'>
            <Link
              href='/login'
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' })
              )}
            >
              Sign in
            </Link>
            <Link
              href='/register'
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Bento grid */}
      <main className='mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8'>
        <BentoGrid>
          {/* ── Hero ── 8 cols × 2 rows */}
          <BentoCell
            colSpan={8}
            rowSpan={2}
            className='relative min-h-[340px] animate-in fade-in slide-in-from-bottom-4 duration-700'
          >
            <TierRowsBackground />
            <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_30%_65%,oklch(0.62_0.22_250/0.14)_0%,transparent_68%)]' />
            <div className='relative flex h-full flex-col justify-end p-7 lg:p-10'>
              <div className='mb-4'>
                <span className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
                  Now in beta
                </span>
              </div>
              <h1 className='font-heading text-4xl font-semibold leading-[1.15] tracking-tight text-foreground lg:text-5xl'>
                Rank everything.
                <br />
                Share instantly.
              </h1>
              <p className='mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground'>
                Build tier lists for any topic in seconds. Movies, games,
                albums&mdash;drag, rank, and share with one link.
              </p>
              <div className='mt-7 flex items-center gap-2.5'>
                <Link
                  href='/register'
                  className={cn(buttonVariants({ size: 'default' }))}
                >
                  Get started
                </Link>
                <Link
                  href='/login'
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' })
                  )}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </BentoCell>

          {/* ── Feature 1 — Build in seconds ── */}
          <BentoCell
            colSpan={4}
            className='flex animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:80ms]'
          >
            <div
              onMouseMove={handleSpotlight}
              className='relative flex flex-col justify-between p-6'
            >
              <div
                className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
                style={{
                  background:
                    'radial-gradient(250px circle at var(--spotlight-x, 50%) var(--spotlight-y, 0%), oklch(0.62 0.22 250 / 0.07), transparent 70%)',
                }}
              />
              <div className='relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/10 transition-[ring-color,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:ring-primary/20'>
                <MousePointerClick
                  size={16}
                  strokeWidth={1.5}
                  className='animate-[bento-float_4s_ease-in-out_infinite]'
                />
              </div>
              <div className='relative'>
                <h3 className='font-heading text-sm font-semibold text-foreground transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-primary'>
                  Build in seconds
                </h3>
                <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                  Drag items into your tier list. No friction, no account
                  needed to start.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* ── Feature 2 — Share with a link ── */}
          <BentoCell
            colSpan={4}
            className='flex animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:160ms]'
          >
            <div
              onMouseMove={handleSpotlight}
              className='relative flex flex-col justify-between p-6'
            >
              <div
                className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
                style={{
                  background:
                    'radial-gradient(250px circle at var(--spotlight-x, 50%) var(--spotlight-y, 0%), oklch(0.62 0.22 250 / 0.07), transparent 70%)',
                }}
              />
              <div className='relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/10 transition-[ring-color,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:ring-primary/20'>
                <Link2
                  size={16}
                  strokeWidth={1.5}
                  className='animate-[bento-float_4s_ease-in-out_infinite_0.5s]'
                />
              </div>
              <div className='relative'>
                <h3 className='font-heading text-sm font-semibold text-foreground transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-primary'>
                  Share with a link
                </h3>
                <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                  One URL. Works on any device. No downloads, no installs
                  required.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* ── Feature 3 — Any category ── */}
          <BentoCell
            colSpan={4}
            className='flex animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:240ms]'
          >
            <div
              onMouseMove={handleSpotlight}
              className='relative flex flex-col justify-between p-6'
            >
              <div
                className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
                style={{
                  background:
                    'radial-gradient(250px circle at var(--spotlight-x, 50%) var(--spotlight-y, 0%), oklch(0.62 0.22 250 / 0.07), transparent 70%)',
                }}
              />
              <div className='relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/10 transition-[ring-color,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:ring-primary/20'>
                <Layers
                  size={16}
                  strokeWidth={1.5}
                  className='animate-[bento-float_4s_ease-in-out_infinite_1s]'
                />
              </div>
              <div className='relative'>
                <h3 className='font-heading text-sm font-semibold text-foreground transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-primary'>
                  Any category
                </h3>
                <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                  Movies, games, albums, food&mdash;if it can be ranked,
                  tier-maker handles it.
                </p>
              </div>
            </div>
          </BentoCell>

          {/* ── Social proof — tier list mockup ── */}
          <BentoCell
            colSpan={8}
            className='animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:320ms]'
          >
            <div className='p-6'>
              <p className='mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground'>
                See it in action
              </p>
              <TierListMockup />
            </div>
          </BentoCell>
        </BentoGrid>
      </main>
    </div>
  )
}
