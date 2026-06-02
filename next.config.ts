import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-auth'],
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
}

export default nextConfig
