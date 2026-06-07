import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { MotionProvider } from '@/components/motion-provider'
import { PageTransition } from '@/components/page-transition'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: { default: 'Tier Maker', template: '%s | Tier Maker' },
  description: 'Build and share tier lists for anything. Movies, games, albums — drag, rank, and share with one link.',
}

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        geist.variable
      )}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <ThemeProvider>
            <PageTransition>{children}</PageTransition>
            <Toaster />
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  )
}
