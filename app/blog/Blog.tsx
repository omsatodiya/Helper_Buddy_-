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
    <section className="py-16 bg-gray-50" ref={containerRef}>
      <div className="container mx-auto px-4">
        <h2 className="blog-title text-3xl font-bold text-center mb-12">
          Our Blog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div 
              key={post._id}
              ref={el => cardsRef.current[index] = el}
              className="blog-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  y: -8,
                  duration: 0.2,
                  ease: 'power2.out'
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  duration: 0.2,
                  ease: 'power2.out'
                });
              }}
            >
              <div className="relative h-64 w-full overflow-hidden cursor-pointer">
                <div className="absolute inset-0">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                
                <div className="flex flex-col mb-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">By {post.author}</p>
                    <div className="flex items-center text-gray-500 mt-1">
                      <span>{formatDate(post.publishedDate)}</span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-600 flex-grow line-clamp-3">
                  {post.description}
                </p>
                
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleEdit(post._id)}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(post._id)}
                    variant="outline"
                    className="bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={() => router.push('/blog/newblog')}
            className="relative bg-white h-full min-h-[24rem] rounded-lg shadow-md overflow-hidden flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
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
              <h3 className="text-xl font-semibold text-gray-800">Add New Blog</h3>
              <p className="text-gray-500 text-center mt-2">
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