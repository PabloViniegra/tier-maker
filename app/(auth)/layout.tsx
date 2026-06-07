import { TierRowsBackground } from '@/components/tier-rows-background'
import { FadeUp } from '@/components/ui/fade-up'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='flex min-h-dvh'>
      {/* Left decorative panel — desktop only */}
      <div aria-hidden="true" className='relative hidden overflow-hidden border-r border-border bg-background lg:flex lg:w-1/2'>
        <TierRowsBackground />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,oklch(0.62_0.22_250/0.12)_0%,transparent_65%)]' />
        <div className='relative z-10 flex h-full w-full flex-col justify-end p-10'>
          <p className='font-heading text-2xl font-semibold text-foreground'>Tier Maker</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Create and share tier lists with the community
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <main id="main-content" className='flex w-full flex-col items-center justify-center bg-background p-6 lg:w-1/2 lg:p-12'>
        <div className='w-full max-w-sm'>
          {/* Wordmark — mobile only (desktop shows it in left panel) */}
          <div className='mb-6 text-center lg:hidden'>
            <h1 className='font-heading text-2xl font-semibold tracking-tight text-foreground'>
              Tier Maker
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Create and share tier lists with the community
            </p>
          </div>
          <FadeUp onMount className='rounded-xl border border-border bg-card p-6 shadow-overlay'>
            {children}
          </FadeUp>
        </div>
      </main>
    </div>
  )
}
