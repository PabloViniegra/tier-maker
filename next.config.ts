import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-auth'],
  experimental: {
    viewTransition: true,
  },
}

export default nextConfig
