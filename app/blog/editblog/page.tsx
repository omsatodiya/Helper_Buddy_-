"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { BlogModel } from '../BlogModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const tags = ['beauty', 'lifestyle', 'homepage', 'fashion', 'health', 'food'];

const EditBlog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    readTime: '',
    description: '',
    imageUrl: '',
    tags: [] as string[],
    fullDescription: '',
  });

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
          readTime: blogData.readTime || '',
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if there are any changes
    const hasChanges = Object.keys(formData).some(key => 
      JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
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
      await BlogModel.update(id, formData);
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-playfair mb-4">
            Edit Blog Post
          </h1>
          <p className="text-gray-600 text-lg font-inter">
            Update your thoughts and ideas
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700 block">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-800 text-base"
                placeholder="Enter blog title"
              />
            </div>

            {/* Author Input */}
            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium text-gray-700 block">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                value={formData.author}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-800 text-base"
                placeholder="Enter author name"
              />
            </div>

            {/* Read Time Input */}
            <div className="space-y-2">
              <label htmlFor="readTime" className="text-sm font-medium text-gray-700 block">
                Read Time
              </label>
              <input
                type="text"
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-800 text-base"
                placeholder="e.g., 5 min read"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700 block">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-800 text-base"
                placeholder="Enter blog description"
              />
            </div>

            {/* Image URL Input */}
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 block">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-800 text-base"
                placeholder="Enter image URL"
              />
            </div>

            {/* Tags Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Description Input */}
            <div className="space-y-2">
              <label htmlFor="fullDescription" className="text-sm font-medium text-gray-700 block">
                Full Description
              </label>
              <textarea
                id="fullDescription"
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-800 text-base"
                placeholder="Enter full blog content"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSubmitting ? 'Updating...' : 'Update Blog Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 font-playfair">
              Update Blog Post
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-base">
              {Object.keys(formData).some(key => 
                JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
              )
                ? 'Are you sure you want to update this blog post with your changes?'
                : 'No changes have been made to the blog post.'}
            </DialogDescription>
          </DialogHeader>

          {Object.keys(formData).some(key => 
            JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
          ) && (
            <div className="py-4 border-t border-b border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">Changes made to:</h4>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                {Object.keys(formData).map(key => {
                  if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) {
                    return (
                      <li key={key} className="flex items-center">
                        <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
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
              className="mr-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
            >
              Cancel
            </Button>
            {Object.keys(formData).some(key => 
              JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
            ) && (
              <Button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
                className="bg-gray-900 hover:bg-gray-800 text-white"
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

export default EditBlog;