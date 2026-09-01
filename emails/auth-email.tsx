interface AuthEmailProps {
  preview: string
  eyebrow: string
  title: string
  message: string
  action: string
  url: string
  note: string
}

const accent = '#0086ff'
const actionBlue = '#006fe6'
const ink = '#0b0e14'
const muted = '#526174'
const border = '#dce4ef'
const canvas = '#eef2f7'
const softBlue = '#eff6ff'

function TierMark() {
  const bar = {
    backgroundColor: accent,
    borderRadius: '2px',
    display: 'block',
    fontSize: 0,
    height: '4px',
    lineHeight: 0,
  }

  return (
    <table
      aria-hidden="true"
      border={0}
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={mark}
    >
      <tbody>
        <tr>
          <td style={{ ...bar, width: '36px' }} />
        </tr>
        <tr>
          <td height="5" style={{ fontSize: 0, lineHeight: 0 }} />
        </tr>
        <tr>
          <td style={{ ...bar, width: '25px', opacity: 0.65 }} />
        </tr>
        <tr>
          <td height="5" style={{ fontSize: 0, lineHeight: 0 }} />
        </tr>
        <tr>
          <td style={{ ...bar, width: '14px', opacity: 0.35 }} />
        </tr>
      </tbody>
    </table>
  )
}

function AuthEmail({
  preview,
  eyebrow,
  title,
  message,
  action,
  url,
  note,
}: AuthEmailProps) {
  return (
    <html lang="en">
      <body style={body}>
        <div style={preheader}>{preview}</div>
        <table
          border={0}
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
          style={outerTable}
          width="100%"
        >
          <tbody>
            <tr>
              <td align="center" style={outerCell}>
                <table
                  border={0}
                  cellPadding={0}
                  cellSpacing={0}
                  role="presentation"
                  style={frame}
                  width={600}
                >
                  <tbody>
                    <tr>
                      <td style={topRule} />
                    </tr>
                    <tr>
                      <td style={header}>
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          role="presentation"
                          width="100%"
                        >
                          <tbody>
                            <tr>
                              <td style={markCell}>
                                <TierMark />
                              </td>
                              <td style={brandCell}>
                                <p style={brandName}>TIER MAKER</p>
                                <p style={brandTagline}>Rank what matters</p>
                              </td>
                              <td align="right" style={headerMeta}>
                                <p style={headerMetaText}>ACCOUNT</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={content}>
                        <p style={eyebrowStyle}>{eyebrow}</p>
                        <h1 style={heading}>{title}</h1>
                        <p style={messageStyle}>{message}</p>
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          role="presentation"
                          style={buttonTable}
                          width="100%"
                        >
                          <tbody>
                            <tr>
                              <td align="center" style={buttonCell}>
                                <a href={url} style={button}>
                                  {action}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          role="presentation"
                          style={noteTable}
                          width="100%"
                        >
                          <tbody>
                            <tr>
                              <td style={noteMarker} />
                              <td style={noteCell}>
                                <p style={noteText}>{note}</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p style={fallbackIntro}>
                          Having trouble with the button? Open this link:
                        </p>
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          role="presentation"
                          style={linkTable}
                          width="100%"
                        >
                          <tbody>
                            <tr>
                              <td style={linkCell}>
                                <p style={linkLabel}>SECURE LINK</p>
                                <a href={url} style={link}>
                                  {url}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={footer}>
                        <p style={footerBrand}>TIER MAKER</p>
                        <p style={footerText}>
                          Build, rank, and share tier lists for anything.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p style={ignoreText}>
                  If you did not request this email, you can ignore it.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export function VerificationEmail({ url }: { url: string }) {
  return (
    <AuthEmail
      action="Verify email"
      eyebrow="ACCOUNT VERIFICATION"
      message="Confirm your email address to finish creating your account and sign in."
      note="Your account stays locked until you confirm this address."
      preview="Verify your Tier Maker email address"
      title="Verify your email"
      url={url}
    />
  )
}

export function PasswordResetEmail({ url }: { url: string }) {
  return (
    <AuthEmail
      action="Reset password"
      eyebrow="PASSWORD RESET"
      message="Use the link below to choose a new password for your account."
      note="This private link will expire. If you did not request a reset, ignore this email."
      preview="Reset your Tier Maker password"
      title="Reset your password"
      url={url}
    />
  )
}

const body = {
  backgroundColor: canvas,
  color: ink,
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: 0,
  padding: 0,
  width: '100%',
}

const preheader = {
  display: 'none',
  fontSize: 1,
  lineHeight: 1,
  maxHeight: 0,
  maxWidth: 0,
  opacity: 0,
  overflow: 'hidden',
}

const outerTable = {
  backgroundColor: canvas,
  margin: 0,
  padding: 0,
}

const outerCell = {
  padding: '32px 16px 16px',
}

const frame = {
  backgroundColor: '#ffffff',
  border: `1px solid ${border}`,
  borderRadius: '16px',
  margin: '0 auto',
  maxWidth: '600px',
  overflow: 'hidden',
  width: '100%',
}

const topRule = {
  backgroundColor: accent,
  fontSize: 0,
  height: '6px',
  lineHeight: 0,
}

const header = {
  backgroundColor: ink,
  padding: '25px 28px 23px',
}

const mark = {
  width: '36px',
}

const markCell = {
  paddingRight: '12px',
  verticalAlign: 'middle' as const,
  width: '36px',
}

const brandCell = {
  verticalAlign: 'middle' as const,
}

const brandName = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 800,
  letterSpacing: '1.8px',
  lineHeight: '18px',
  margin: 0,
}

const brandTagline = {
  color: '#a8b4c5',
  fontSize: '12px',
  lineHeight: '17px',
  margin: '3px 0 0',
}

const headerMeta = {
  verticalAlign: 'middle' as const,
}

const headerMetaText = {
  color: '#7f8da1',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '1.4px',
  lineHeight: '14px',
  margin: 0,
}

const content = {
  padding: '36px 28px 32px',
}

const eyebrowStyle = {
  color: actionBlue,
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '1.6px',
  lineHeight: '16px',
  margin: '0 0 13px',
}

const heading = {
  color: ink,
  fontFamily: 'Trebuchet MS, Arial, Helvetica, sans-serif',
  fontSize: '30px',
  fontWeight: 700,
  letterSpacing: '-0.7px',
  lineHeight: '36px',
  margin: 0,
}

const messageStyle = {
  color: muted,
  fontSize: '16px',
  lineHeight: '25px',
  margin: '16px 0 26px',
  maxWidth: '480px',
}

const buttonTable = {
  margin: '0 0 22px',
}

const buttonCell = {
  backgroundColor: actionBlue,
  borderRadius: '9px',
}

const button = {
  backgroundColor: actionBlue,
  border: '1px solid #005fcb',
  borderRadius: '9px',
  color: '#ffffff',
  display: 'block',
  fontSize: '15px',
  fontWeight: 700,
  lineHeight: '20px',
  padding: '14px 20px',
  textAlign: 'center' as const,
  textDecoration: 'none',
}

const noteTable = {
  backgroundColor: softBlue,
  border: '1px solid #dbeafe',
  borderRadius: '9px',
  margin: '0 0 26px',
}

const noteMarker = {
  backgroundColor: accent,
  borderRadius: '8px 0 0 8px',
  fontSize: 0,
  lineHeight: 0,
  width: '4px',
}

const noteCell = {
  padding: '13px 15px',
}

const noteText = {
  color: '#27517e',
  fontSize: '13px',
  lineHeight: '19px',
  margin: 0,
}

const fallbackIntro = {
  color: muted,
  fontSize: '13px',
  lineHeight: '19px',
  margin: '0 0 9px',
}

const linkTable = {
  backgroundColor: '#f7f9fc',
  border: `1px solid ${border}`,
  borderRadius: '9px',
}

const linkCell = {
  padding: '13px 15px 14px',
}

const linkLabel = {
  color: muted,
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '1.4px',
  lineHeight: '14px',
  margin: '0 0 5px',
}

const link = {
  color: actionBlue,
  fontFamily: 'Courier New, Courier, monospace',
  fontSize: '12px',
  lineHeight: '18px',
  overflowWrap: 'anywhere' as const,
  wordBreak: 'break-all' as const,
}

const footer = {
  backgroundColor: '#f7f9fc',
  borderTop: `1px solid ${border}`,
  padding: '20px 28px 22px',
}

const footerBrand = {
  color: ink,
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '1.5px',
  lineHeight: '15px',
  margin: 0,
}

const footerText = {
  color: muted,
  fontSize: '12px',
  lineHeight: '18px',
  margin: '4px 0 0',
}

const ignoreText = {
  color: muted,
  fontSize: '11px',
  lineHeight: '17px',
  margin: '14px auto 0',
  maxWidth: '600px',
  textAlign: 'center' as const,
}
