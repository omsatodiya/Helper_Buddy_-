"use client";
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import gsap from 'gsap';

interface BlogPost {
  _id: string;
  title: string;
  author: string;
  publishedDate: string;
  readTime: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const Blog: React.FC = () => {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        setBlogPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      // Fade in the title
      gsap.from('.blog-title', {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power2.out'
      });

      // Stagger the cards
      gsap.from(cardsRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        stagger: 0.2,
        ease: 'power2.out'
      });
    }
  }, [isLoading]);

  const handleEdit = (id: string) => {
    router.push(`/blog/editblog?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
  
    try {
      console.log('Deleting blog with ID:', id);
      const response = await fetch(`/api/blogs?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete blog');
      }
  
      // Remove the blog from state
      setBlogPosts(prevPosts => prevPosts.filter(post => post._id !== id));
      console.log('Blog deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete blog');
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="text-center p-4">
        No blog posts available.
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50" ref={containerRef}>
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="blog-title text-3xl font-bold text-center mb-8 text-gray-800">
          Our Blog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <div 
              key={post._id}
              ref={el => cardsRef.current[index] = el}
              className="blog-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-[520px] border border-gray-100"
              style={{ opacity: 1 }}
            >
              <div 
                className="relative h-80 overflow-hidden bg-white cursor-pointer"
                onClick={() => handleEdit(post._id)}
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105 cursor-pointer"
                    style={{
                      imageRendering: '-webkit-optimize-contrast',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      opacity: 1
                    }}
                    loading="eager"
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.naturalWidth === 0) {
                        img.src = post.imageUrl;
                      }
                      img.style.opacity = '1';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center cursor-pointer">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-grow bg-white" style={{ opacity: 1 }}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {post.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                      +{post.tags.length - 2} more
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-semibold mb-2 text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                  {post.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span className="font-medium text-gray-700">by {post.author}</span>
                  <div className="flex items-center space-x-1">
                    <span>{formatDate(post.publishedDate)}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow">
                  {post.description}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                    <Button
                      onClick={() => handleEdit(post._id)}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(post._id)}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-red-50 text-red-600 border-red-200"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={() => router.push('/blog/newblog')}
            className="relative bg-white h-[520px] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 hover:border-blue-400 hover:bg-white group"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                Add New Blog
              </h3>
              <p className="text-gray-500 text-sm text-center group-hover:text-gray-600 transition-colors">
                Click here to create a new blog post
              </p>
            </div>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Blog;