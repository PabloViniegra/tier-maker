import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-auth'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
}

export default nextConfig
