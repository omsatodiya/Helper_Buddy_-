"use client";

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';

// Create a loading component
function LoadingBlog() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center">
        <div className="w-12 h-12 border-2 border-t-transparent border-black dark:border-white rounded-full animate-spin" />
      </div>
      <Footer />
    </>
  );
}

// Dynamically import the client component with ssr disabled
const WholeBlogClient = dynamic(
  () => import('./WholeBlogClient'),
  { ssr: false }
);

export default function WholeBlog() {
  const pathname = usePathname();

  useEffect(() => {
    // Add structured data for the blog
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Dudh-Kela Blog',
      description: 'Expert insights and updates from the dairy industry',
      url: `https://dudhkela.com${pathname}`,
      publisher: {
        '@type': 'Organization',
        name: 'Dudh-Kela',
        logo: {
          '@type': 'ImageObject',
          url: 'https://dudhkela.com/logo.png'
        }
      },
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      potentialAction: {
        '@type': 'ReadAction',
        target: [`https://dudhkela.com${pathname}`]
      }
    };

    // Add structured data to the page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pathname]);

  return (
    <Suspense fallback={<LoadingBlog />}>
      <WholeBlogClient />
    </Suspense>
  );
}