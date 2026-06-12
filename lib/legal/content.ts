export type LegalSection = {
  title: string
  content: string
}

export type LegalPageData = {
  title: string
  lastUpdated: string
  sections: LegalSection[]
}

export const termsSections: LegalSection[] = [
  {
    title: '1. Acceptance of terms',
    content:
      'By creating an account or using Tier Maker you agree to be bound by these Terms of Service. If you do not agree, you must discontinue use of the service.',
  },
  {
    title: '2. Accounts',
    content:
      'You are responsible for the security of your account and for any activity that occurs under your credentials. Notify us immediately of any unauthorised use.',
  },
  {
    title: '3. User content',
    content:
      'You retain ownership of the tier lists, images, and text you upload. By publishing a tier list as public you grant Tier Maker a non-exclusive licence to display and distribute it through the service.',
  },
  {
    title: '4. Prohibited use',
    content:
      'You agree not to upload content that is unlawful, infringing, hateful, or that targets protected groups. We may remove such content and suspend accounts that violate this rule.',
  },
  {
    title: '5. Termination',
    content:
      'We may suspend or terminate access at any time for conduct that breaches these terms. You may delete your account at any time from your account settings.',
  },
  {
    title: '6. Disclaimer',
    content:
      'The service is provided \u201cas is\u201d without warranties of any kind. To the extent permitted by law, we disclaim all liability for damages arising from your use of the service.',
  },
  {
    title: '7. Changes',
    content:
      'We may update these terms from time to time. The \u201clast updated\u201d date at the top of this document will reflect the latest revision. Continued use of the service constitutes acceptance of the updated terms.',
  },
  {
    title: '8. Contact',
    content: 'Questions about these terms can be sent to legal@tier-maker.app.',
  },
]

export const privacySections: LegalSection[] = [
  {
    title: '1. Information we collect',
    content:
      'When you create an account we collect your email address, display name, and the password hash. If you sign in with Google, we receive the profile information you authorise from your Google account. Anonymous browsing of public tier lists does not require an account.',
  },
  {
    title: '2. Content you create',
    content:
      'Tier lists, item images you upload, and tier fills you save are stored in our database and associated with your account. Cover images are hosted on our image storage provider.',
  },
  {
    title: '3. Cookies and local storage',
    content:
      'We use a session cookie to keep you signed in. Your theme preference and your draft tier edits are stored in your browser so that you do not lose work between page loads.',
  },
  {
    title: '4. How we use your information',
    content:
      'We use the information we collect to operate the service, authenticate you, prevent abuse, and send you essential notices. We do not sell your personal data to third parties.',
  },
  {
    title: '5. Sharing',
    content:
      'We share data only with the infrastructure providers that run the service (hosting, database, image storage, email delivery) and only to the extent required to operate the service. These providers are bound by data-processing agreements.',
  },
  {
    title: '6. Your rights',
    content:
      'You can update your profile information, delete your tier lists, and delete your account at any time. Deleting your account removes your personal data, except where retention is required by law.',
  },
  {
    title: '7. Security',
    content:
      'Passwords are stored as salted hashes. Connections to the service are encrypted in transit. Access to production data is restricted to a small group of operators.',
  },
  {
    title: '8. Contact',
    content: 'Privacy questions can be sent to privacy@tier-maker.app.',
  },
]
