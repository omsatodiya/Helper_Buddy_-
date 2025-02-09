"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface BlogPost {
  _id: string;
  title: string;
  author: string;
  publishedDate: string;
  readTime: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  tags: string[];
}

export default function WholeBlog() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log('Fetching blog with ID:', params.id);
        // Updated fetch URL to match your API route
        const response = await fetch(`/api/blogs/wholeblog?id=${params.id}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        console.log('Received blog data:', data);
        setBlog(data);
      } catch (error) {
        console.error('Fetch error:', error);
        router.push('/blog');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20 bg-gray-50">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
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
        <main className="min-h-screen pt-20 bg-gray-50">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-800">Blog not found</h1>
            <button 
              onClick={() => router.push('/blog')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      <main className="min-h-screen pt-20 bg-gray-50">
        <article className="max-w-5xl mx-auto px-4 py-12">
          {/* Hero Image */}
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-8">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-gray-600 mb-8">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">{blog.author}</span>
                <span>•</span>
                <time>
                  {new Date(blog.publishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <span>{blog.readTime}</span>
            </div>

            {/* Description */}
            <div className="text-gray-700 leading-relaxed space-y-6">
              <p className="text-xl font-medium text-gray-600">
                {blog.description}
              </p>
              <div className="whitespace-pre-wrap">
                {blog.fullDescription}
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-12 text-center">
              <button 
                onClick={() => router.push('/blog')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Blogs
              </button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}