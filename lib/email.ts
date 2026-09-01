import 'server-only'
import { createHash } from 'node:crypto'
import { render } from '@react-email/render'
import { Resend } from 'resend'

import { PasswordResetEmail, VerificationEmail } from '@/emails/auth-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const from = 'Tier Maker <auth@send.pabloviniegra.dev>'

async function sendEmail({
  to,
  subject,
  react,
  idempotencyKey,
}: {
  to: string
  subject: string
  react: React.ReactElement
  idempotencyKey: string
}) {
  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ])
  const { error } = await resend.emails.send(
    { from, to, subject, html, text },
    { idempotencyKey }
  )

  if (error) {
    throw new Error(`Resend failed: ${error.message}`)
  }
}

function emailKey(kind: string, token: string) {
  const digest = createHash('sha256').update(token).digest('hex')
  return `${kind}/${digest}`
}

export function sendVerificationEmail({
  to,
  url,
  token,
}: {
  to: string
  url: string
  token: string
}) {
  return sendEmail({
    to,
    subject: 'Verify your Tier Maker email',
    react: VerificationEmail({ url }),
    idempotencyKey: emailKey('email-verification', token),
  })
}

export function sendPasswordResetEmail({
  to,
  url,
  token,
}: {
  to: string
  url: string
  token: string
}) {
  return sendEmail({
    to,
    subject: 'Reset your Tier Maker password',
    react: PasswordResetEmail({ url }),
    idempotencyKey: emailKey('password-reset', token),
  })
}
