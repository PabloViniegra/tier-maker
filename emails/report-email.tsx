type ReportEmailProps = {
  reportId: string
  reason: string
  details: string | null
  tierListTitle: string
  url: string
}

const text = {
  color: '#0b0e14',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '14px',
  lineHeight: '22px',
}

export function ReportEmail({
  reportId,
  reason,
  details,
  tierListTitle,
  url,
}: ReportEmailProps) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#eef2f7', padding: '24px' }}>
        <h1 style={{ ...text, fontSize: '20px' }}>Tier list reported</h1>
        <p style={text}>
          <strong>Tier list:</strong> <a href={url}>{tierListTitle}</a>
        </p>
        <p style={text}>
          <strong>Reason:</strong> {reason}
        </p>
        {details ? (
          <p style={text}>
            <strong>Details:</strong> {details}
          </p>
        ) : null}
        <p style={{ ...text, color: '#526174', fontSize: '12px' }}>
          Report ID: {reportId}
        </p>
      </body>
    </html>
  )
}
