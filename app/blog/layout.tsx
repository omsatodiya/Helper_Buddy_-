import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dudh-Kela Blog | Dairy Industry Insights & Updates',
  description: 'Explore expert insights about dairy industry, milk delivery services, and healthy living. Stay updated with Dudh-Kela\'s latest news and trends.',
  keywords: ['dairy blog', 'milk delivery insights', 'dairy industry news', 'healthy living', 'Dudh-Kela updates'],
  openGraph: {
    type: 'website',
    title: 'Dudh-Kela Blog - Your Source for Dairy Industry Insights',
    description: 'Discover the latest trends, tips, and updates in the dairy industry with Dudh-Kela\'s expert blog content.',
    url: 'https://dudhkela.com/blog',
    siteName: 'Dudh-Kela Blog',
    images: [
      {
        url: '/blog-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dudh-Kela Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dudh-Kela Blog - Dairy Industry Insights',
    description: 'Expert insights and updates from the dairy industry.',
    images: ['/blog-twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://dudhkela.com/blog',
    languages: {
      'en-US': 'https://dudhkela.com/en/blog',
      'hi-IN': 'https://dudhkela.com/hi/blog',
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-layout">
      <main className="min-h-screen bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
} 