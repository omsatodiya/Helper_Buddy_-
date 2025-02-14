import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Service Providers | Dudh-Kela',
    template: '%s | Dudh-Kela Service Provider'
  },
  description: 'Find and book trusted dairy service providers in your area. Quality services, verified providers, and reliable delivery.',
  keywords: ['dairy service providers', 'milk delivery', 'dairy services', 'local dairy', 'Dudh-Kela providers'],
  openGraph: {
    type: 'website',
    title: 'Service Providers - Dudh-Kela',
    description: 'Find trusted dairy service providers in your area',
    images: [
      {
        url: '/service-providers-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Dudh-Kela Service Providers',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dudhkela.com/service-provider',
    languages: {
      'en-US': 'https://dudhkela.com/en/service-provider',
      'hi-IN': 'https://dudhkela.com/hi/service-provider',
    },
  },
};

export default function ServiceProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="service-provider-layout">{children}</div>;
} 