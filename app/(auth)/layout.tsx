import Link from 'next/link'

import { AuthTierPreview } from '@/components/auth-tier-preview'
import { TierMakerIcon } from '@/components/tier-maker-icon'
import { TierRowsBackground } from '@/components/tier-rows-background'
import { FadeUp } from '@/components/ui/fade-up'

interface AuthLayoutProps {
  children: React.ReactNode
}

function Wordmark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight text-foreground"
      >
        <TierMakerIcon size={20} aria-hidden="true" />
        <span translate="no">Tier Maker</span>
      </Link>
    </div>
  )
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh">
      <div className="relative hidden min-h-dvh flex-col justify-center overflow-hidden border-r border-border bg-card px-10 py-10 lg:flex lg:w-1/2">
        <TierRowsBackground showLabels={false} />
        <div className="relative z-10">
          <Wordmark />
          <p className="mt-1 text-sm text-muted-foreground">
            Create and share tier lists with the community
          </p>
          <div className="mt-10">
            <AuthTierPreview />
          </div>
        </div>
      </div>

      <main
        id="main-content"
        className="flex w-full flex-col items-center justify-center bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:w-1/2 lg:p-12"
      >
        <div className="w-full max-w-sm">
          <AuthTierPreview compact className="mb-6 lg:hidden" />
          <Wordmark className="mb-8 lg:hidden" />
          <FadeUp
            onMount
            className="rounded-lg border border-border bg-card p-6 lg:border-0 lg:bg-transparent lg:p-0"
          >
            {children}
          </FadeUp>
        </div>
      </main>
    </div>
  )
}
