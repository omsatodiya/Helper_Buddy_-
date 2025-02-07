import React from 'react';
import Blog from '@/app/blog/Blog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function BlogPage() {
  return (
    <>
    <Header />
    <main className="pt-24">
      <Blog />
    </main>
    <Footer />
    </>
  );
}