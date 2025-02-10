"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogModel } from '../BlogModel';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  publishedDate?: string;
  readTime?: string;
  description: string;
  fullDescription?: string;
  imageUrl?: string;
  tags?: string[];
}

export default function WholeBlog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const id = searchParams.get('id');
        if (!id) throw new Error('Blog ID is missing');
        
        const blogData = await BlogModel.getById(id);
        if (!blogData) throw new Error('Blog not found');
        
        setBlog(blogData);
      } catch (error) {
        console.error('Fetch error:', error);
        router.push('/blog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [searchParams, router]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-800">Blog not found</h1>
            <button 
              onClick={() => router.push('/blog')}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Blogs
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <article className="max-w-4xl mx-auto px-4">
          <div className="pt-32 pb-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-playfair leading-tight">
                {blog.title}
              </h1>
              <div className="flex flex-col items-center space-y-4">
                <div className="text-lg text-gray-600">
                  By <span className="font-semibold text-gray-900">{blog.author}</span>
                </div>
                {blog.publishedDate && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Released on {formatDate(blog.publishedDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {blog.imageUrl && (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div className="text-xl md:text-2xl text-gray-600 mb-12 font-medium leading-relaxed border-l-4 border-gray-900 pl-6">
                {blog.description}
              </div>
              
              {blog.fullDescription && (
                <div className="text-gray-800 leading-relaxed space-y-6">
                  {blog.fullDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-16 text-center">
              <button 
                onClick={() => router.push('/blog')}
                className="group px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 inline-flex items-center space-x-3 hover:-translate-x-1"
              >
                <svg 
                  className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Blogs</span>
              </button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}