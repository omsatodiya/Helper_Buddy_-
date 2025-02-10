"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { BlogModel } from './BlogModel';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Clock, User, Tag } from 'lucide-react';
import { cn } from "@/lib/utils";

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
    ? blogPosts.filter(post => post.tags.some(tag => 
        tag.toLowerCase() === selectedTag.toLowerCase()
      ))
    : blogPosts;

  useEffect(() => {
    if (!isLoading) {
      // Reset opacity of all cards to 0 before animating
      gsap.set(blogCardsRef.current, { opacity: 0, y: 20 });
      
      // Animate visible cards
      gsap.to(blogCardsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
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
            <div key={i} className="bg-black/5 dark:bg-white/5 h-64 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-black/5 dark:bg-white/5 rounded-full p-4 mb-4">
          <svg className="w-8 h-8 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Error Loading Blogs</h3>
        <p className="text-black/75 dark:text-white/75">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 mb-16" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black dark:text-white">
            Discover Our Blog
          </h1>
          <p className="text-black/75 dark:text-white/75 max-w-2xl mx-auto">
            Explore our latest thoughts, ideas, and insights about beauty, lifestyle, and wellness.
          </p>
        </div>

        <div className="mb-12">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              onClick={() => setSelectedTag(null)}
              variant={selectedTag === null ? "default" : "outline"}
              className={cn(
                "rounded-full",
                selectedTag === null 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              )}
            >
              All Posts
            </Button>
            {getAllTags().map((tag) => (
              <Button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                variant={selectedTag === tag ? "default" : "outline"}
                className={cn(
                  "rounded-full whitespace-nowrap",
                  selectedTag === tag 
                    ? "bg-black text-white dark:bg-white dark:text-black" 
                    : "border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                )}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <div
              key={post.id}
              ref={(el: HTMLDivElement | null) => {
                if (el) blogCardsRef.current[index] = el;
              }}
              className="opacity-0 group relative bg-white dark:bg-black rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white"
            >
              <div className="aspect-w-16 aspect-h-10 relative overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-medium text-black dark:text-white border border-black dark:border-white rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 
                  className="text-xl font-semibold mb-2 text-black dark:text-white hover:opacity-75 transition-opacity cursor-pointer line-clamp-2"
                  onClick={() => router.push(`/blog/wholeblog?id=${post.id}`)}
                >
                  {post.title}
                </h3>

                <p className="text-black/75 dark:text-white/75 line-clamp-2 mb-4 text-sm">
                  {post.description}
                </p>

                <div className="flex items-center justify-between text-sm text-black/60 dark:text-white/60">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/blog/editblog?id=${post.id}`);
                    }}
                    size="sm"
                    variant="secondary"
                    className="bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlog(post);
                      setDialogType('delete');
                      setDialogOpen(true);
                    }}
                    size="sm"
                    variant="destructive"
                    className="bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Blog Card */}
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) blogCardsRef.current[filteredPosts.length] = el;
            }}
            onClick={() => router.push('/blog/newblog')}
            className="opacity-0 group cursor-pointer relative border-2 border-dashed border-black/50 dark:border-white/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-black dark:hover:border-white bg-white dark:bg-black transition-all duration-300"
          >
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              <div className="bg-black/5 dark:bg-white/5 rounded-full p-4 mb-4">
                <PlusCircle className="w-8 h-8 text-black dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                Create New Blog
              </h3>
              <p className="text-black/75 dark:text-white/75">
                Share your thoughts with the world
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white dark:bg-black border border-black dark:border-white">
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
      </div>
    </section>
  );
};

export default Blog;