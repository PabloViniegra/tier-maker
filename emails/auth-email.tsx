interface AuthEmailProps {
  preview: string
  title: string
  message: string
  action: string
  url: string
}

function AuthEmail({ preview, title, message, action, url }: AuthEmailProps) {
  return (
    <html lang="en">
      <body style={body}>
        <div style={previewText}>{preview}</div>
        <div style={container}>
          <p style={brand}>Tier Maker</p>
          <h1 style={heading}>{title}</h1>
          <p style={text}>{message}</p>
          <a href={url} style={button}>
            {action}
          </a>
          <p style={help}>If the button does not work, open this link:</p>
          <a href={url} style={link}>
            {url}
          </a>
          <p style={footer}>
            If you did not request this email, you can ignore it.
          </p>
        </div>
      </body>
    </html>
  )
}

export function VerificationEmail({ url }: { url: string }) {
  return (
    <AuthEmail
      preview="Verify your Tier Maker email address"
      title="Verify your email"
      message="Confirm your email address to finish creating your account and sign in."
      action="Verify email"
      url={url}
    />
  )
}

export function PasswordResetEmail({ url }: { url: string }) {
  return (
    <AuthEmail
      preview="Reset your Tier Maker password"
      title="Reset your password"
      message="Use the link below to choose a new password for your account."
      action="Reset password"
      url={url}
    />
  )
}

const body = {
  backgroundColor: '#f4f4f5',
  color: '#18181b',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: '40px 16px',
}

const previewText = {
  display: 'none',
  maxHeight: 0,
  maxWidth: 0,
  opacity: 0,
  overflow: 'hidden',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '520px',
  padding: '32px',
}

const brand = {
  color: '#2563eb',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 24px',
}

const heading = {
  fontSize: '26px',
  lineHeight: '32px',
  margin: '0 0 16px',
}

const text = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'block',
  fontSize: '15px',
  fontWeight: '700',
  padding: '12px 20px',
  textAlign: 'center' as const,
  textDecoration: 'none',
}

const help = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 4px',
}

const link = {
  color: '#2563eb',
  fontSize: '13px',
  lineHeight: '20px',
  wordBreak: 'break-all' as const,
}

const footer = {
  borderTop: '1px solid #e4e4e7',
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '28px 0 0',
  paddingTop: '20px',
}
