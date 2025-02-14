export const defaultSEOConfig = {
  titleTemplate: '%s | Helper Buddy',
  defaultTitle: 'Helper Buddy - Professional Home Services & Maintenance',
  description: 'Book trusted home service professionals for cleaning, repairs, maintenance and more. Get verified experts for all your household needs with guaranteed satisfaction.',
  canonical: 'https://dudhkela.netlify.app',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://dudhkela.netlify.app',
    siteName: 'Helper Buddy',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Helper Buddy Services',
      },
    ],
  },
  twitter: {
    handle: '@helperbuddy',
    site: '@helperbuddy',
    cardType: 'summary_large_image',
  },
};

export const generateMetadata = (
  title: string,
  description?: string,
  path?: string,
  image?: string
) => ({
  title,
  description: description || defaultSEOConfig.description,
  canonical: `${defaultSEOConfig.canonical}${path || ''}`,
  openGraph: {
    ...defaultSEOConfig.openGraph,
    title,
    description: description || defaultSEOConfig.description,
    url: `${defaultSEOConfig.canonical}${path || ''}`,
    images: [
      {
        url: image || defaultSEOConfig.openGraph.images[0].url,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    ...defaultSEOConfig.twitter,
    title,
    description: description || defaultSEOConfig.description,
    image: image || defaultSEOConfig.openGraph.images[0].url,
  },
}); 