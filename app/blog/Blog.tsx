"use client";
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import gsap from 'gsap';
import { BlogModel } from './BlogModel';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
  readTime: string;
  description: string;
  imageUrl: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

const Blog: React.FC = () => {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Add state for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete'>('edit');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await BlogModel.getAll();
        setBlogPosts(blogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      gsap.from('.blog-title', {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power2.out'
      });

      gsap.set(cardsRef.current, {
        opacity: 1,
        y: 0
      });
    }
  }, [isLoading]);

  const handleBlogClick = (id: string) => {
    router.push(`/blog/wholeblog?id=${id}&type=whole`);
  };

  const handleEditClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleDeleteClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setDialogType('delete');
    setDialogOpen(true);
  };

  const handleConfirmDialog = async () => {
    if (!selectedBlog) return;

    try {
      if (dialogType === 'delete') {
        await BlogModel.delete(selectedBlog.id);
        setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== selectedBlog.id));
      } else {
        router.push(`/blog/editblog?id=${selectedBlog.id}`);
      }
    } catch (error) {
      console.error(`${dialogType} error:`, error);
    } finally {
      setDialogOpen(false);
      setSelectedBlog(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
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

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16" ref={containerRef}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="blog-title text-4xl md:text-5xl font-bold text-gray-800 font-playfair mb-4">
            Our Blog
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-inter">
            Discover our latest thoughts, ideas, and insights about beauty, lifestyle, and wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div 
              key={post.id}
              ref={el => cardsRef.current[index] = el}
              className="blog-card bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-[480px] border border-gray-100 transform hover:-translate-y-1"
            >
              <div 
                onClick={() => router.push(`/blog/wholeblog?id=${post.id}`)}
                className="relative h-72 overflow-hidden bg-gray-100 cursor-pointer group/image"
              >
                {post.imageUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-medium text-sm bg-black/40 px-4 py-2 rounded-full opacity-0 group-hover/image:opacity-100 transform translate-y-2 group-hover/image:translate-y-0 transition-all duration-300">
                        View Full Post
                      </span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover/image:bg-gray-150 transition-colors"
                  >
                    <span className="text-gray-400 font-medium">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-grow bg-white">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {post.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs font-medium text-gray-500">
                        +{post.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                <h3 className="text-lg font-bold mb-2 text-gray-800 line-clamp-2 font-playfair hover:text-blue-600 transition-colors cursor-pointer">
                  {post.title}
                </h3>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">{post.author}</span>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <span className="font-medium">{formatDate(post.publishedDate)}</span>
                    {post.readTime && (
                      <>
                        <span>•</span>
                        <span className="font-medium">{post.readTime}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow font-inter leading-relaxed">
                  {post.description}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex justify-end space-x-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(post);
                      }}
                      variant="outline"
                      size="sm"
                      className="px-4 py-2 text-sm font-semibold bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(post);
                      }}
                      variant="destructive"
                      size="sm"
                      className="px-4 py-2 text-sm font-semibold bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 transition-all duration-200"
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
            className="relative bg-white h-[480px] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 group transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <svg
                  className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors"
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
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors font-playfair">
                Add New Blog
              </h3>
              <p className="text-gray-500 text-base text-center font-medium group-hover:text-gray-600 transition-colors max-w-xs">
                Create New Blog
              </p>
            </div>
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 font-playfair">
              {dialogType === 'delete' ? 'Delete Blog' : 'Edit Blog'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-base">
              {dialogType === 'delete' 
                ? 'Are you sure you want to delete this blog? This action cannot be undone.'
                : 'You are about to edit this blog post. Continue?'}
            </DialogDescription>
          </DialogHeader>

          {selectedBlog && (
            <div className="py-4 border-t border-b border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedBlog.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedBlog.description}</p>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="mr-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={dialogType === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirmDialog}
              className={dialogType === 'delete' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-900 hover:bg-gray-800 text-white'}
            >
              {dialogType === 'delete' ? 'Delete' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Blog;