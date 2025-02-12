"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { BlogModel } from '../BlogModel';
import gsap from 'gsap';
import { ArrowLeft, Image as ImageIcon, Clock, User, FileText, Tags } from 'lucide-react';
import { cn } from "@/lib/utils";
import AdminProtected from '@/components/auth/AdminProtected';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { validateImage } from '@/lib/imageUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from 'lucide-react';

const tags = ['Beauty', 'Lifestyle', 'Homepage', 'Fashion', 'Health', 'Food'];

function NewBlog() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<(HTMLDivElement | null)[]>([]);
  const spinnerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    readTime: '',
    description: '',
    tags: [] as string[],
    fullDescription: '',
    publishedDate: new Date().toISOString(),
    imageFile: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Add error state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [dialogOpen, setDialogOpen] = useState(false);

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

      // Animate progress bars
      progressRef.current.forEach((el, index) => {
        gsap.from(el, {
          scaleX: 0,
          duration: 0.5,
          delay: 0.5 + index * 0.1,
          ease: "power2.out"
        });
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Animate form content on step change
    const formContent = document.querySelector('.step-content');
    gsap.fromTo(formContent,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [currentStep]);

  useEffect(() => {
    // Spinner animation
    if (isSubmitting && spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "none"
      });
    }
  }, [isSubmitting]);

  useEffect(() => {
    // Verify Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      console.error('Missing Cloudinary configuration:', {
        cloudName: !!cloudName,
        uploadPreset: !!uploadPreset
      });
    } else {
      console.log('Cloudinary configuration loaded:', {
        cloudName,
        uploadPreset
      });
    }
  }, []);

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ['title', 'author', 'readTime'];
      case 2:
        return ['imageFile', 'tags'];
      case 3:
        return ['description', 'fullDescription'];
      default:
        return [];
    }
  };

  const handleNextStep = () => {
    // Only validate current step fields
    const currentFields = getCurrentStepFields();
    const newErrors: {[key: string]: string} = {};

    currentFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (field === 'tags') {
        if (formData.tags.length === 0) {
          newErrors.tags = 'Please select at least one tag';
        }
      } else if (field === 'imageFile' && !formData.imageFile) {
        newErrors.imageFile = 'Please select an image';
      } else if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(step => step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }

    const currentFields = getCurrentStepFields();
    const newErrors: {[key: string]: string} = {};

    // Validate fields
    currentFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (field === 'tags') {
        if (formData.tags.length === 0) {
          newErrors.tags = 'Please select at least one tag';
        }
      } else if (field === 'imageFile' && !formData.imageFile) {
        newErrors.imageFile = 'Please select an image';
      } else if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const blogData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        readTime: `${formData.readTime.trim()} min read`,
        tags: formData.tags,
        publishedDate: new Date().toISOString(),
      };

      // Create blog post with image file
      const blogId = await BlogModel.create(blogData, formData.imageFile);
      console.log('Blog created successfully with ID:', blogId);

      setDialogOpen(true);
    } catch (error) {
      console.error('Error creating blog:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create blog post. Please try again.'
      }));
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Clear error for the field being changed
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    
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

  // Helper function to format read time
  const formatReadTime = (minutes: string) => {
    if (!minutes) return '';
    return `${minutes} min read`;
  };

  const handleTagToggle = (tag: string) => {
    // Clear tag error when selecting tags
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.tags;
      return newErrors;
    });

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

  const inputStyles = (error?: string) => cn(
    "w-full px-4 py-3 rounded-xl border transition-all bg-white dark:bg-black text-black dark:text-white",
    error 
      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
      : "border-black dark:border-white focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
  );
  const labelStyles = "text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2";
  const tagStyles = (isSelected: boolean) => cn(
    "px-4 py-2 rounded-full text-sm font-medium transition-all",
    isSelected
      ? "bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10"
      : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          imageFile: 'Please upload an image file'
        }));
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imageFile: 'Image must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      setErrors(prev => {
        const { imageFile, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleConfirmRedirect = () => {
    window.location.href = '/blog';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content space-y-6">
            <div className="space-y-2">
              <label className={labelStyles}>
                <FileText className="w-4 h-4" />
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={inputStyles(errors.title)}
                placeholder="Enter an engaging title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <User className="w-4 h-4" />
                Author
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={inputStyles(errors.author)}
                placeholder="Your name"
              />
              {errors.author && (
                <p className="text-sm text-red-500 mt-1">{errors.author}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Clock className="w-4 h-4" />
                Read Time (in minutes)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  className={cn(inputStyles(errors.readTime), "pr-16")}
                  placeholder="5"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600">
                  minutes
                </span>
              </div>
              {errors.readTime && (
                <p className="text-sm text-red-500 mt-1">{errors.readTime}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content space-y-6">
            <div className="space-y-2">
              <label className={labelStyles}>
                <ImageIcon className="w-4 h-4" />
                Cover Image *
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={cn(
                    "w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0",
                    "file:text-sm file:font-semibold file:bg-black file:text-white",
                    "hover:file:bg-black/80 cursor-pointer",
                    "dark:file:bg-white dark:file:text-black",
                    "dark:hover:file:bg-white/80"
                  )}
                />
                {formData.imageFile && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(formData.imageFile)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {errors.imageFile && (
                  <p className="text-sm text-red-500 mt-1">{errors.imageFile}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Tags className="w-4 h-4" />
                Tags *
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    onMouseEnter={handleTagHover}
                    onMouseLeave={handleTagLeave}
                    className={tagStyles(formData.tags.includes(tag))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {errors.tags && (
                <p className="text-sm text-red-500 mt-1">{errors.tags}</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content space-y-6">
            <div className="space-y-2">
              <label className={labelStyles}>
                Short Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={inputStyles(errors.description)}
                placeholder="Write a brief description"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                Full Content *
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={8}
                className={inputStyles(errors.fullDescription)}
                placeholder="Write your blog post content"
              />
              {errors.fullDescription && (
                <p className="text-sm text-red-500 mt-1">{errors.fullDescription}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-white dark:bg-black py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="header-content text-center mb-12">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Create New Blog Post
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Share your thoughts and ideas with the world
            </p>
          </div>

          <div ref={formRef} className="bg-white dark:bg-black rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    ref={(el: HTMLDivElement | null) => {
                      progressRef.current[index] = el;
                    }}
                    className={cn(
                      "w-full h-1 rounded-full",
                      index < currentStep 
                        ? "bg-black dark:bg-white" 
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {errors.submit && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => currentStep > 1 && setCurrentStep(step => step - 1)}
                  disabled={currentStep === 1 || isSubmitting}
                  className="px-6 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white disabled:opacity-50"
                >
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="px-6 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div
                          ref={spinnerRef}
                          className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"
                        />
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      'Publish Post'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black rounded-2xl p-6 border border-black dark:border-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Success!
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white opacity-75 mt-2 text-base">
              Your blog post has been created successfully and will be published shortly. Click below to view all blogs.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              onClick={handleConfirmRedirect}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
            >
              View All Blogs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Wrap the NewBlog component with AdminProtected
export default function ProtectedNewBlog() {
  return (
    <AdminProtected>
      <NewBlog />
    </AdminProtected>
  );
}