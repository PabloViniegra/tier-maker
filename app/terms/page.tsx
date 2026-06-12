import type { Metadata } from 'next'
import { LegalSections } from '@/components/legal/legal-sections'
import { termsSections } from '@/lib/legal/content'

export const metadata: Metadata = {
  title: 'Terms of Service — Tier Maker',
  description:
    'Terms of Service for Tier Maker. Read about account responsibilities, content ownership, and acceptable use.',
  openGraph: {
    type: 'article',
    title: 'Terms of Service — Tier Maker',
    description:
      'Terms of Service for Tier Maker. Read about account responsibilities, content ownership, and acceptable use.',
  },
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">
        Terms of Service
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated June 7, 2026.
      </p>
      <LegalSections sections={termsSections} />
    </main>
  )
}
