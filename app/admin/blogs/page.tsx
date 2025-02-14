"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PenSquare, User, Clock, Tag, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { BlogModel } from "@/app/blog/BlogModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
  readTime: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const ITEMS_PER_PAGE = 10;

export default function BlogsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const blogs = await BlogModel.getAll();
        const formattedBlogs: BlogPost[] = blogs.map(blog => ({
          id: blog.id,
          title: blog.title || '',
          author: blog.author || '',
          publishedDate: blog.publishedDate || new Date().toISOString(),
          readTime: blog.readTime || '5 min read',
          description: blog.description || '',
          imageUrl: blog.imageUrl || '',
          tags: blog.tags || []
        }));
        setBlogPosts(formattedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch blog posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleDeleteBlog = async (blogId: string) => {
    try {
      setIsLoading(true);
      await BlogModel.delete(blogId);
      setBlogPosts((prevPosts) => prevPosts.filter((post) => post.id !== blogId));
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPaginatedData = (data: BlogPost[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const paginatedBlogs = getPaginatedData(blogPosts, currentPage);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black dark:text-white">
          Blog Management
        </h2>
        <Button
          onClick={() => router.push('/blog/newblog')}
          className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Blog
        </Button>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
        {blogPosts.length > 0 ? (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {paginatedBlogs.map((post) => (
              <div key={post.id} className="p-4 bg-white dark:bg-black hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start gap-4">
                  <img 
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-20 h-20 rounded-lg object-cover border border-black/10 dark:border-white/10"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-black dark:text-white truncate">
                          {post.title}
                        </h3>
                        <p className="text-sm text-black/60 dark:text-white/60 line-clamp-2">
                          {post.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4 text-sm text-black/60 dark:text-white/60">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {post.tags.join(', ')}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/blog/editblog?id=${post.id}`)}
                        className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                      >
                        Edit Blog
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedBlog(post);
                          setDialogOpen(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Blog
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
              <PenSquare className="h-6 w-6 text-black/40 dark:text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-1">
              No Blog Posts Yet
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60">
              Create your first blog post to get started
            </p>
          </div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(blogPosts.length / ITEMS_PER_PAGE))}
        onPageChange={setCurrentPage}
      />

      {/* Blog Delete Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white dark:bg-black border border-black dark:border-white">
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-black dark:border-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedBlog) {
                  handleDeleteBlog(selectedBlog.id);
                }
                setDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 