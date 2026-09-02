import 'server-only'
import { createHash } from 'node:crypto'
import { render } from '@react-email/render'
import { Resend } from 'resend'

import { PasswordResetEmail, VerificationEmail } from '@/emails/auth-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const from = 'Tier Maker <auth@send.pabloviniegra.dev>'

function validateEmailUrl(rawUrl: string) {
  let parsed: URL

  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('Invalid authentication email URL')
  }

  const isLocalHttp =
    parsed.protocol === 'http:' &&
    (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
  const allowedOrigins = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    'https://tier.pabloviniegra.dev',
    'https://project-hbojo.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ]
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => new URL(origin).origin)

  if (parsed.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('Invalid authentication email URL')
  }

  if (allowedOrigins.length > 0 && !allowedOrigins.includes(parsed.origin)) {
    throw new Error('Invalid authentication email URL')
  }

  return rawUrl
}

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

export async function sendVerificationEmail({
  to,
  url,
  token,
}: {
  to: string
  url: string
  token: string
}) {
  const safeUrl = validateEmailUrl(url)

  return sendEmail({
    to,
    subject: 'Verify your Tier Maker email',
    react: VerificationEmail({ url: safeUrl }),
    idempotencyKey: emailKey('email-verification', token),
  })
}

export async function sendPasswordResetEmail({
  to,
  url,
  token,
}: {
  to: string
  url: string
  token: string
}) {
  const safeUrl = validateEmailUrl(url)

  return sendEmail({
    to,
    subject: 'Reset your Tier Maker password',
    react: PasswordResetEmail({ url: safeUrl }),
    idempotencyKey: emailKey('password-reset', token),
  })
}
