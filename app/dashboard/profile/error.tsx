'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-3 p-6 text-center"
      role="alert"
    >
      <h1 className="font-heading text-xl text-balance">
        We couldn’t load your profile
      </h1>
      <p className="max-w-sm text-sm text-pretty text-muted-foreground">
        Your account information is unavailable right now. Try again to reload
        it.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
