'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function TermsModal() {
  return (
    <Dialog>
      <DialogTrigger className='text-foreground/80 transition-colors hover:text-foreground'>
        Terms of Service
      </DialogTrigger>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>Last updated June 7, 2026.</DialogDescription>
        </DialogHeader>
        <div className='space-y-4 text-sm leading-relaxed text-foreground/90'>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>1. Acceptance of terms</h3>
            <p>
              By creating an account or using Tier Maker you agree to be bound by these Terms of Service.
              If you do not agree, you must discontinue use of the service.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>2. Accounts</h3>
            <p>
              You are responsible for the security of your account and for any activity that occurs under
              your credentials. Notify us immediately of any unauthorised use.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>3. User content</h3>
            <p>
              You retain ownership of the tier lists, images, and text you upload. By publishing a tier
              list as public you grant Tier Maker a non-exclusive licence to display and distribute it
              through the service.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>4. Prohibited use</h3>
            <p>
              You agree not to upload content that is unlawful, infringing, hateful, or that targets
              protected groups. We may remove such content and suspend accounts that violate this rule.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>5. Termination</h3>
            <p>
              We may suspend or terminate access at any time for conduct that breaches these terms.
              You may delete your account at any time from your account settings.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>6. Disclaimer</h3>
            <p>
              The service is provided &ldquo;as is&rdquo; without warranties of any kind. To the extent
              permitted by law, we disclaim all liability for damages arising from your use of the
              service.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>7. Changes</h3>
            <p>
              We may update these terms from time to time. The &ldquo;last updated&rdquo; date at the
              top of this document will reflect the latest revision. Continued use of the service
              constitutes acceptance of the updated terms.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>8. Contact</h3>
            <p>
              Questions about these terms can be sent to{' '}
              <a className='underline underline-offset-4 hover:text-foreground' href='mailto:legal@tier-maker.app'>
                legal@tier-maker.app
              </a>
              .
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
