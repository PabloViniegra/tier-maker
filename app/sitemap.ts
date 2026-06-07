import type { MetadataRoute } from 'next'
import { getAllPublicTierListIds } from '@/lib/queries/tier-templates'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tier-maker.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const publicTierLists = await getAllPublicTierListIds()
  const dynamicRoutes: MetadataRoute.Sitemap = publicTierLists.map(({ id, createdAt }) => ({
    url: `${baseUrl}/explore/${id}`,
    lastModified: createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...dynamicRoutes]
}
