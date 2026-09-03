import { ImageResponse } from 'next/og'
import { getPublicTierListBySlug } from '@/lib/queries/tier-templates'

export const size = {
  width: 1200,
  height: 630,
}

export const revalidate = 3600 // Cache for 1 hour

// Hoist the font fetch to module level so it only loads once
const geistSansFetch = fetch(
  new URL(
    'https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-400-normal.woff'
  )
).then((res) => {
  if (!res.ok) throw new Error(`Failed to load font (${res.status})`)
  return res.arrayBuffer()
})

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getPublicTierListBySlug(slug)

  if (!data) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0b',
          color: '#a1a1aa',
          fontFamily: 'Geist Sans',
          fontSize: 32,
        }}
      >
        Tier list not found
      </div>,
      { ...size }
    )
  }

  const geistSans = await geistSansFetch
  const tierCount = data.rows.length
  const firstThreeRows = data.rows.slice(0, 3)

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#0a0a0b',
        color: '#fafafa',
        fontFamily: 'Geist Sans',
        padding: 64,
      }}
    >
      {/* Category badge */}
      <div
        style={{
          display: 'flex',
          fontSize: 18,
          color: '#a1a1aa',
          marginBottom: 16,
        }}
      >
        {data.category}
      </div>

      {/* Title */}
      <div
        style={{
          display: 'flex',
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 40,
          maxWidth: '80%',
        }}
      >
        {data.title}
      </div>

      {/* Mini tier preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {firstThreeRows.map((row) => (
          <div
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Tier label chip */}
            <div
              style={{
                display: 'flex',
                width: 80,
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                background: row.color,
                color: '#ffffff',
                fontSize: 28,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {row.label}
            </div>
            {/* Tier items preview */}
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              {row.items.slice(0, 5).map((item) => (
                <div
                  key={item.url}
                  style={{
                    display: 'flex',
                    width: 64,
                    height: 64,
                    borderRadius: 6,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    overflow: 'hidden',
                  }}
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt=""
                      width={64}
                      height={64}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#52525b',
                        fontSize: 12,
                      }}
                    >
                      {item.label.slice(0, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* More tiers indicator */}
      {tierCount > 3 && (
        <div
          style={{
            display: 'flex',
            marginTop: 16,
            fontSize: 18,
            color: '#52525b',
          }}
        >
          +{tierCount - 3} more tiers
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 48,
          left: 64,
          fontSize: 20,
          color: '#52525b',
        }}
      >
        Tier Maker
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Geist Sans',
          data: geistSans,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
