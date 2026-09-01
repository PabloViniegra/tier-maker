import type { Metadata } from 'next'
import { LegalSections } from '@/components/legal/legal-sections'
import { privacySections } from '@/lib/legal/content'
import { formatLongDate, LEGAL_UPDATED_AT } from '@/lib/utils/format-date'

export const metadata: Metadata = {
  title: 'Privacy Policy — Tier Maker',
  description:
    'Privacy Policy for Tier Maker. Learn about what data we collect, how we use it, and your rights.',
  openGraph: {
    type: 'article',
    title: 'Privacy Policy — Tier Maker',
    description:
      'Privacy Policy for Tier Maker. Learn about what data we collect, how we use it, and your rights.',
  },
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">
        Privacy Policy
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated {formatLongDate(LEGAL_UPDATED_AT)}.
      </p>
      <LegalSections sections={privacySections} />
    </main>
  )
}
