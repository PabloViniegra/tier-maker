import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const revalidate = 86400 // Cache for 24 hours

// Hoist font fetch to module level
const geistSansFetch = fetch(
  new URL(
    'https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-700-normal.woff'
  )
).then((res) => {
  if (!res.ok) throw new Error(`Failed to load font (${res.status})`)
  return res.arrayBuffer()
})

export default async function OgImage() {
  const geistSans = await geistSansFetch

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0b',
        color: '#fafafa',
        fontFamily: 'Geist Sans',
        padding: 64,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 72,
          fontWeight: 700,
        }}
      >
        Tier Maker
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 24,
          fontSize: 28,
          color: '#a1a1aa',
        }}
      >
        Build, rank, and share tier lists for anything.
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Geist Sans',
          data: geistSans,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
