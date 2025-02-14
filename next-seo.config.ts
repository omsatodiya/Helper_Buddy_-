import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  title: 'Helper Buddy - Your Trusted Partner for Household Services',
  description: 'Find reliable household services including cleaning, appliance repair, plumbing, electrical work and more. Book trusted professionals for your home service needs.',
  canonical: 'https://dudhkela.netlify.app',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://dudhkela.netlify.app',
    siteName: 'Helper Buddy',
    title: 'Helper Buddy - Professional Home Services',
    description: 'Your trusted partner for finding reliable household services and professionals. Book verified service providers for cleaning, repairs, and maintenance.',
    images: [
      {
        url: 'https://dudhkela.netlify.app/images/logo.jpg', // Add your OG image path
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
  additionalMetaTags: [
    {
      name: 'google-site-verification',
      content: 'plElx_sKYUqrw8K3SbepJDyBvbV1GwVYTavL7rMeo3E'
    },
    {
      name: 'keywords',
      content: 'home services, cleaning services, appliance repair, plumbing, electrical work, handyman, house cleaning, AC service, carpenter'
    }
  ],
}; 