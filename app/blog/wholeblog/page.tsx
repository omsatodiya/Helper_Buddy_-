import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
  return (
    <Suspense fallback={<LoadingBlog />}>
      <WholeBlogClient />
    </Suspense>
  );
}