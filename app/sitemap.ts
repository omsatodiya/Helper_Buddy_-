import { MetadataRoute } from 'next'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getFirestore()
  
  // Fetch all service providers
  const providersSnapshot = await getDocs(collection(db, 'providers'))
  const providerUrls = providersSnapshot.docs.map(doc => ({
    url: `https://dudhkela.com/service-provider/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Fetch all blog posts
  const blogsSnapshot = await getDocs(collection(db, 'blogs'))
  const blogUrls = blogsSnapshot.docs.map(doc => ({
    url: `https://dudhkela.com/blog/${doc.id}`,
    lastModified: new Date(doc.data().updatedAt || doc.data().createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: 'https://dudhkela.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://dudhkela.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...providerUrls,
    ...blogUrls,
  ]
} 