"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { BlogModel } from '../BlogModel';
import gsap from 'gsap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Image as ImageIcon, Clock, User, FileText, Tags, Save, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import AdminProtected from '@/components/auth/AdminProtected';

const tags = ['Beauty', 'Lifestyle', 'Homepage', 'Fashion', 'Health', 'Food'];

interface FormData {
  title: string;
  author: string;
  readTime: string;
  description: string;
  imageUrl: string;
  tags: string[];
  fullDescription: string;
  [key: string]: string | string[];
}

const EditBlog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    author: '',
    readTime: '',
    description: '',
    imageUrl: '',
    tags: [],
    fullDescription: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial page load animation
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out"
      });

      gsap.from(".header-content > *", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out"
      });

      gsap.from(formRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: 0.4,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        router.push('/blog');
        return;
      }

      try {
        const blogData = await BlogModel.getById(id);
        if (!blogData) {
          throw new Error('Blog not found');
        }
        
        const initialData = {
          title: blogData.title || '',
          author: blogData.author || '',
          readTime: (blogData.readTime || '').replace(/[^0-9]/g, ''),
          description: blogData.description || '',
          imageUrl: blogData.imageUrl || '',
          tags: Array.isArray(blogData.tags) ? blogData.tags : [],
          fullDescription: blogData.fullDescription || '',
        };
        setOriginalData(initialData);
        setFormData(initialData);
      } catch (error) {
        console.error('Fetch error:', error);
        router.push('/blog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'readTime') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const handleTagHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleTagLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const hasChanges = Object.keys(formData).some(key => 
      JSON.stringify(formData[key]) !== JSON.stringify(originalData?.[key])
    );

    if (!hasChanges) {
      setDialogOpen(true);
      return;
    }

    setDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!id) return;
    setIsSubmitting(true);

    try {
      const updatedData = {
        ...formData,
        readTime: `${formData.readTime} min read`
      };
      await BlogModel.update(id, updatedData);
      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
      setDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center">
        <div className="w-12 h-12 border-2 border-t-transparent border-black dark:border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputStyles = "w-full px-4 py-3 rounded-xl border border-black dark:border-white focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50 transition-all bg-white dark:bg-black text-black dark:text-white";
  const labelStyles = "text-sm font-medium text-black dark:text-white flex items-center gap-2";
  const tagStyles = (isSelected: boolean) => cn(
    "px-4 py-2 rounded-full text-sm font-medium transition-all",
    isSelected
      ? "bg-black dark:bg-white text-white dark:text-black"
      : "border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-black py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-black dark:text-white opacity-75 hover:opacity-100 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Button>

        <div className="header-content text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            Edit Blog Post
          </h1>
          <p className="text-black dark:text-white opacity-75">
            Update your thoughts and ideas
          </p>
        </div>

        <div ref={formRef} className="bg-white dark:bg-black rounded-2xl shadow-xl border border-black dark:border-white p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className={labelStyles}>
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className={inputStyles}
                placeholder="Enter blog title"
              />
            </div>

            {/* Author Input */}
            <div className="space-y-2">
              <label htmlFor="author" className={labelStyles}>
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                value={formData.author}
                onChange={handleInputChange}
                className={inputStyles}
                placeholder="Enter author name"
              />
            </div>

            {/* Read Time Input */}
            <div className="space-y-2">
              <label htmlFor="readTime" className={labelStyles}>
                Read Time
              </label>
              <input
                type="text"
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                className={inputStyles}
                placeholder="e.g., 5 min read"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label htmlFor="description" className={labelStyles}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={inputStyles}
                placeholder="Enter blog description"
              />
            </div>

            {/* Image URL Input */}
            <div className="space-y-2">
              <label htmlFor="imageUrl" className={labelStyles}>
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className={inputStyles}
                placeholder="Enter image URL"
              />
            </div>

            {/* Tags Selection */}
            <div className="space-y-3">
              <label className={labelStyles}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    onMouseEnter={() => handleTagHover}
                    onMouseLeave={() => handleTagLeave}
                    className={tagStyles(formData.tags.includes(tag))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Description Input */}
            <div className="space-y-2">
              <label htmlFor="fullDescription" className={labelStyles}>
                Full Description
              </label>
              <textarea
                id="fullDescription"
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={6}
                className={inputStyles}
                placeholder="Enter full blog content"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-black dark:border-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Blog Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black rounded-2xl p-6 border border-black dark:border-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black dark:text-white">
              Update Blog Post
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white opacity-75 mt-2 text-base">
              {Object.keys(formData).some(key => 
                JSON.stringify(formData[key]) !== JSON.stringify(originalData?.[key])
              )
                ? 'Are you sure you want to update this blog post with your changes?'
                : 'No changes have been made to the blog post.'}
            </DialogDescription>
          </DialogHeader>

          {Object.keys(formData).some(key => 
            JSON.stringify(formData[key]) !== JSON.stringify(originalData?.[key])
          ) && (
            <div className="py-4 border-t border-b border-black dark:border-white">
              <h4 className="font-medium text-black dark:text-white mb-2">Changes made to:</h4>
              <ul className="mt-2 text-sm text-black dark:text-white opacity-75 space-y-1">
                {Object.keys(formData).map(key => {
                  if (JSON.stringify(formData[key]) !== JSON.stringify(originalData?.[key])) {
                    return (
                      <li key={key} className="flex items-center">
                        <span className="w-2 h-2 bg-black dark:bg-white rounded-full mr-2"></span>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="mr-2 bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Cancel
            </Button>
            {Object.keys(formData).some(key => 
              JSON.stringify(formData[key]) !== JSON.stringify(originalData?.[key])
            ) && (
              <Button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
                className="bg-black dark:bg-white text-white dark:text-black disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Confirm Update'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function ProtectedEditBlog() {
  return (
    <AdminProtected>
      <EditBlog />
    </AdminProtected>
  );
}