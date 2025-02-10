"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { BlogModel } from '../BlogModel';

const tags = ['beauty', 'lifestyle', 'homepage', 'fashion', 'health', 'food'];

export default function NewBlog() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    readTime: '',
    description: '',
    imageUrl: '',
    tags: [] as string[],
    fullDescription: '',
    publishedDate: new Date().toISOString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!BlogModel.validateBlog(formData)) {
        throw new Error('Please fill in all required fields');
      }

      const blogData = {
        ...formData,
        publishedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await BlogModel.create(blogData);
      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-playfair mb-4">
            Create New Blog Post
          </h1>
          <p className="text-gray-600 text-lg font-inter">
            Share your thoughts and ideas with the world
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
                {isSubmitting ? 'Creating...' : 'Create Blog Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}