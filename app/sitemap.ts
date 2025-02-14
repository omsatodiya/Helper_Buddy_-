import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Get your base URL from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dudhkela.netlify.app'
  
  // Add all your static routes
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/admin/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/payment`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Add more routes as needed
  ]
} 