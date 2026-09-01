'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <button
          onClick={reset}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
