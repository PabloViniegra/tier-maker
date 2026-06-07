'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function PrivacyModal() {
  return (
    <Dialog>
      <DialogTrigger className='text-foreground/80 transition-colors hover:text-foreground'>
        Privacy Policy
      </DialogTrigger>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>Last updated June 7, 2026.</DialogDescription>
        </DialogHeader>
        <div className='space-y-4 text-sm leading-relaxed text-foreground/90'>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>1. Information we collect</h3>
            <p>
              When you create an account we collect your email address, display name, and the password
              hash. If you sign in with Google, we receive the profile information you authorise from
              your Google account. Anonymous browsing of public tier lists does not require an account.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>2. Content you create</h3>
            <p>
              Tier lists, item images you upload, and tier fills you save are stored in our database and
              associated with your account. Cover images are hosted on our image storage provider.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>3. Cookies and local storage</h3>
            <p>
              We use a session cookie to keep you signed in. Your theme preference and your draft tier
              edits are stored in your browser so that you do not lose work between page loads.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>4. How we use your information</h3>
            <p>
              We use the information we collect to operate the service, authenticate you, prevent abuse,
              and send you essential notices. We do not sell your personal data to third parties.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>5. Sharing</h3>
            <p>
              We share data only with the infrastructure providers that run the service (hosting,
              database, image storage, email delivery) and only to the extent required to operate the
              service. These providers are bound by data-processing agreements.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>6. Your rights</h3>
            <p>
              You can update your profile information, delete your tier lists, and delete your account
              at any time. Deleting your account removes your personal data, except where retention is
              required by law.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>7. Security</h3>
            <p>
              Passwords are stored as salted hashes. Connections to the service are encrypted in
              transit. Access to production data is restricted to a small group of operators.
            </p>
          </section>
          <section>
            <h3 className='mb-1 font-heading text-sm font-semibold text-foreground'>8. Contact</h3>
            <p>
              Privacy questions can be sent to{' '}
              <a className='underline underline-offset-4 hover:text-foreground' href='mailto:privacy@tier-maker.app'>
                privacy@tier-maker.app
              </a>
              .
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
