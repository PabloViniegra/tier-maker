import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { MotionProvider } from '@/components/motion-provider'
import { PageTransition } from '@/components/page-transition'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tier-maker.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: 'Tier Maker', template: '%s | Tier Maker' },
  description: 'Build and share tier lists for anything. Movies, games, albums — drag, rank, and share with one link.',
  openGraph: {
    type: 'website',
    siteName: 'Tier Maker',
    title: 'Tier Maker',
    description: 'Build and share tier lists for anything. Movies, games, albums — drag, rank, and share with one link.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Tier Maker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tier Maker',
    description: 'Build and share tier lists for anything. Movies, games, albums — drag, rank, and share with one link.',
    images: ['/og.png'],
  },
}

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const calSans = localFont({
  src: '../node_modules/@fontsource/cal-sans/files/cal-sans-latin-400-normal.woff2',
  variable: '--font-cal-sans',
  display: 'swap',
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
        geist.variable,
        calSans.variable
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
