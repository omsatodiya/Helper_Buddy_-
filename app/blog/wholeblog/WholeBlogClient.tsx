"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogModel } from '../BlogModel';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from 'next-themes';

gsap.registerPlugin(ScrollTrigger);

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

export default function WholeBlogClient() {
    const { theme } = useTheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const metaRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const fetchBlog = async () => {
        try {
          const id = searchParams?.get('id');
          if (!id) throw new Error('Blog ID is missing');
          
          const blogData = await BlogModel.getById(id);
          if (!blogData) throw new Error('Blog not found');
          
          setBlog(blogData);
        } catch (error) {
          router.push('/blog');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchBlog();
    }, [searchParams, router]);
  
    useEffect(() => {
      if (!isLoading && blog) {
        // Initial animations
        const ctx = gsap.context(() => {
          // Header animation with dark mode consideration
          gsap.from(headerRef.current, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out",
            clearProps: "all" // Ensures proper theme switching
          });
  
          // Meta info animation
          gsap.from(metaRef.current?.children || [], {
            opacity: 0,
            y: 20,
            duration: 0.8,
            stagger: 0.2,
            delay: 0.3,
            ease: "power2.out"
          });
  
          // Image animation
          gsap.from(imageRef.current, {
            opacity: 0,
            scale: 0.9,
            duration: 1.2,
            delay: 0.5,
            ease: "power2.out"
          });
  
          // Content paragraphs animation
          gsap.from(contentRef.current?.children || [], {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          });
        });
  
        return () => ctx.revert();
      }
    }, [isLoading, blog, theme]);
  
    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return '';
      }
    };
  
    // Add this helper function to format the content
    const formatContent = (content: string) => {
      return content.split('\n\n').map(block => {
        if (block.startsWith('# ')) {
          return { type: 'h1', content: block.slice(2) };
        } else if (block.startsWith('## ')) {
          return { type: 'h2', content: block.slice(3) };
        } else if (block.startsWith('- ')) {
          return { type: 'list', content: block.split('\n').map(item => item.slice(2)) };
        } else {
          return { type: 'paragraph', content: block };
        }
      });
    };
  
    if (isLoading) {
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
  
    if (!blog) {
      return (
        <>
          <Header />
          <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Blog not found</h1>
            <Button
              onClick={() => router.push('/blog')}
              className="group flex items-center gap-2 hover:-translate-x-1 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blogs</span>
            </Button>
          </div>
          <Footer />
        </>
      );
    }
  
    return (
      <>
        <Header />
        <div ref={containerRef} className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="fixed top-24 left-8 z-50 text-black dark:text-white opacity-75 hover:opacity-100 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back
          </Button>
  
          <article className="max-w-4xl mx-auto px-4">
            <div className="pt-32 pb-16">
              <div ref={headerRef} className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-8 leading-tight">
                  {blog.title}
                </h1>
                
                <div ref={metaRef} className="flex flex-wrap justify-center gap-6 text-black/60 dark:text-white/60">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{blog.author}</span>
                  </div>
                  {blog.publishedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.publishedDate)}</span>
                    </div>
                  )}
                  {blog.readTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{blog.readTime}</span>
                    </div>
                  )}
                </div>
              </div>
  
              {blog.imageUrl && (
                <div 
                  ref={imageRef}
                  className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-16 shadow-2xl transition-shadow duration-300"
                >
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
  
              <div ref={contentRef} className="prose prose-lg dark:prose-invert max-w-none transition-colors duration-300">
                {/* Description Quote */}
                <div className="text-xl md:text-2xl text-black/75 dark:text-white/75 font-medium leading-relaxed border-l-4 border-black dark:border-white pl-6 mb-12 transition-colors duration-300">
                  {blog.description}
                </div>
                
                {/* Tags Section */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-12">
                    {blog.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm font-medium text-black dark:text-white border border-black dark:border-white rounded-full transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Main Content */}
                {blog.fullDescription && (
                  <div className="space-y-8">
                    {formatContent(blog.fullDescription).map((block, index) => {
                      switch (block.type) {
                        case 'h1':
                          return (
                            <h2 key={index} className="text-3xl font-bold text-black dark:text-white mt-12 mb-6 transition-colors duration-300">
                              {block.content}
                            </h2>
                          );
                        case 'h2':
                          return (
                            <h3 key={index} className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4 transition-colors duration-300">
                              {block.content}
                            </h3>
                          );
                        case 'list':
                          return (
                            <ul key={index} className="list-disc list-inside space-y-2 text-black dark:text-white ml-4 transition-colors duration-300">
                              {Array.isArray(block.content) ? block.content.map((item, i) => (
                                <li key={i} className="text-lg leading-relaxed">
                                  {item}
                                </li>
                              )) : (
                                <li className="text-lg leading-relaxed">
                                  {block.content}
                                </li>
                              )}
                            </ul>
                          );
                        default:
                          return (
                            <p key={index} className="text-lg text-black dark:text-white leading-relaxed transition-colors duration-300">
                              {block.content}
                            </p>
                          );
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
        <Footer />
      </>
    );
} 