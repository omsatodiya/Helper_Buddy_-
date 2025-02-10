"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { BlogModel } from './BlogModel';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Clock, User, Tag } from 'lucide-react';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete'>('edit');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const blogCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await BlogModel.getAll();
        setBlogPosts(blogs as BlogPost[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const getAllTags = () => {
    const tags = blogPosts.flatMap(post => post.tags);
    return Array.from(new Set(tags));
  };

  const filteredPosts = selectedTag
    ? blogPosts.filter(post => post.tags.includes(selectedTag))
    : blogPosts;

  useEffect(() => {
    if (!isLoading && blogCardsRef.current.length > 0) {
      gsap.fromTo(
        blogCardsRef.current,
        { 
          opacity: 0, 
          y: 20 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading, filteredPosts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-8 w-full max-w-6xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 h-64 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Blogs</h3>
        <p className="text-gray-600">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <section className="py-16 px-4" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Tags Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <Button
              onClick={() => setSelectedTag(null)}
              variant={selectedTag === null ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              All Posts
            </Button>
            {getAllTags().map((tag) => (
              <Button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                variant={selectedTag === tag ? "default" : "outline"}
                className="whitespace-nowrap"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <div
              key={post.id}
              ref={(el: HTMLDivElement | null) => {
                if (el) {
                  blogCardsRef.current[index] = el;
                }
              }}
              className="opacity-0 group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/blog/editblog?id=${post.id}`);
                        }}
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 
                  className="text-xl font-semibold mb-2 text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                  onClick={() => router.push(`/blog/wholeblog?id=${post.id}`)}
                >
                  {post.title}
                </h3>

                <p className="text-gray-600 line-clamp-2 mb-4">
                  {post.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Blog Card */}
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                blogCardsRef.current[filteredPosts.length] = el;
              }
            }}
            className="opacity-0 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/blog/newblog')}
          >
            <PlusCircle className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Blog</h3>
            <p className="text-gray-500">Share your thoughts with the world</p>
          </div>
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {selectedTag 
                ? `No posts found with the tag "${selectedTag}"`
                : "Start by creating your first blog post"
              }
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'delete' ? 'Delete Blog Post' : 'Edit Blog Post'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'delete' 
                ? 'Are you sure you want to delete this blog post? This action cannot be undone.'
                : 'You are about to edit this blog post.'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={dialogType === 'delete' ? "destructive" : "default"}
              onClick={() => {
                if (selectedBlog) {
                  if (dialogType === 'delete') {
                    BlogModel.delete(selectedBlog.id);
                    setBlogPosts(posts => posts.filter(p => p.id !== selectedBlog.id));
                  } else {
                    router.push(`/blog/editblog?id=${selectedBlog.id}`);
                  }
                }
                setDialogOpen(false);
              }}
            >
              {dialogType === 'delete' ? 'Delete' : 'Edit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Blog;