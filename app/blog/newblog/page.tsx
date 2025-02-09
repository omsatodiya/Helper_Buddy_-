"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create blog post');
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
    <div className="max-w-4xl mx-auto p-6 py-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Create New Blog Post
        </h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author *
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Read Time *
          </label>
          <input
            type="text"
            value={formData.readTime}
            onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
            placeholder="e.g., 5 min read"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL *
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <textarea
          name="fullDescription"
          value={formData.fullDescription}
          onChange={handleInputChange}
          placeholder="Enter the full blog content..."
          className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags * (Select at least one)
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
          {formData.tags.length === 0 && (
            <p className="text-red-500 text-sm mt-1">
              Please select at least one tag
            </p>
          )}
        </div>
        
        <div className="flex space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || formData.tags.length === 0}
            className={`bg-blue-500 text-white px-6 py-2 rounded-md
              ${isSubmitting || formData.tags.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            {isSubmitting ? 'Creating...' : 'Create Blog Post'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}