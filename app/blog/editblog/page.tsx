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
      JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Blog Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Read Time
            </label>
            <input
              type="text"
              name="readTime"
              value={formData.readTime}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description
            </label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={8}
              placeholder="Enter full blog content (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${formData.tags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Blog Post'}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Update Blog Post
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {Object.keys(formData).some(key => 
                JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])
              )
                ? 'Are you sure you want to update this blog post with your changes?'
                : 'No changes have been made to the blog post.'}
            </DialogDescription>
          </DialogHeader>

          {Object.keys(formData).some(key => 
            JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])
          ) && (
            <div className="py-4">
              <h4 className="font-medium text-gray-900">Changes made to:</h4>
              <ul className="mt-2 text-sm text-gray-500">
                {Object.keys(formData).map(key => {
                  if (JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])) {
                    return (
                      <li key={key} className="mt-1">
                        • {key.charAt(0).toUpperCase() + key.slice(1)}
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="mr-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
            >
              Cancel
            </Button>
            {Object.keys(formData).some(key => 
              JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])
            ) && (
              <Button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Confirm Update'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditBlog;