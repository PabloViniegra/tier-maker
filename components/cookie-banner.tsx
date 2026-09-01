'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useConsentStore } from '@/lib/stores/consent'
import { slideUpVariants } from '@/lib/motion-variants'

export function CookieBanner() {
  const status = useSyncExternalStore(
    useConsentStore.subscribe,
    () => useConsentStore.getState().status,
    () => 'pending' as const
  )

  return (
    <AnimatePresence>
      {status === 'pending' && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          aria-modal="false"
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Cookies and browser storage keep you signed in and save your
              preferences.{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Learn more
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => useConsentStore.getState().reject()}
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => useConsentStore.getState().accept()}
              >
                Accept
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
