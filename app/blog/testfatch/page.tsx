"use client";
import { useEffect, useState } from 'react';
import { BlogModel } from '@/app/blog/BlogModel';

export default function TestFetch() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const data = await BlogModel.getAll();
        console.log('Fetched blogs:', data);
        setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Blogs</h1>
      {blogs.map(blog => (
        <div key={blog.id}>
          <h2>{blog.title}</h2>
          <p>Author: {blog.author}</p>
          <p>{blog.description}</p>
        </div>
      ))}
    </div>
  );
}