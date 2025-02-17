"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { BlogModel } from "./BlogModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Clock,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

const ITEMS_PER_PAGE = 6;

const Blog: React.FC = () => {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"edit" | "delete">("edit");
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blogCardsRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Animation for blog cards
  useEffect(() => {
    if (!isLoading && blogCardsRef.current) {
      const cards = blogCardsRef.current.children;
      
      gsap.fromTo(cards,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading, currentPage, selectedTag]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await BlogModel.getAll();
        setBlogPosts(blogs as BlogPost[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsAdmin(userData?.role === "admin");
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAdminStatus();
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getAllTags = () => {
    const tags = blogPosts.flatMap((post) => post.tags);
    return Array.from(new Set(tags));
  };

  const filteredPosts = selectedTag
    ? blogPosts.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      )
    : blogPosts;

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-8 w-full max-w-6xl">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-black/5 dark:bg-white/5 h-64 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-black/5 dark:bg-white/5 rounded-full p-4 mb-4">
          <svg
            className="w-8 h-8 text-black dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          Error Loading Blogs
        </h3>
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-black dark:text-white">
            Discover Our Blog
          </h1>
          <p className="text-sm sm:text-base text-black/75 dark:text-white/75 max-w-2xl mx-auto px-4">
            Explore our latest thoughts, ideas, and insights about beauty,
            lifestyle, and wellness.
          </p>
        </div>

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4">
            <div className="relative w-full sm:w-auto">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-[calc(100vw-2rem)] sm:max-w-[600px] relative">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2">
                  <Button
                    onClick={() => setSelectedTag(null)}
                    variant={selectedTag === null ? "default" : "outline"}
                    className={cn(
                      "rounded-full text-sm whitespace-nowrap px-4",
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
                        "rounded-full whitespace-nowrap text-sm px-4",
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
              <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white dark:from-black to-transparent pointer-events-none sm:hidden" />
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none sm:hidden" />
            </div>

            {isAdmin && (
              <div className="w-full sm:w-auto">
                <Button
                  onClick={() => router.push("/blog/newblog")}
                  className="flex items-center gap-2 w-full sm:w-auto rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-6"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Post</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4" ref={blogCardsRef}>
          {paginatedPosts.map((post, index) => (
            <div
              key={post.id}
              onClick={() => router.push(`/blog/wholeblog?id=${post.id}`)}
              className="opacity-0 group relative bg-white dark:bg-black rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 cursor-pointer"
            >
              <div className="relative w-full pt-[56.25%] overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-500 ease-in-out" />
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium text-black dark:text-white border border-black dark:border-white rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-black dark:text-white hover:opacity-75 transition-opacity cursor-pointer line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-black/75 dark:text-white/75 line-clamp-2 mb-4 text-xs sm:text-sm">
                  {post.description}
                </p>

                <div className="flex items-center justify-between text-xs sm:text-sm text-black/60 dark:text-white/60">
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

              {isAdmin && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                        setDialogType("delete");
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
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 sm:mt-12 flex justify-center items-center gap-2 sm:gap-4 px-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm",
                      currentPage === page
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    )}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white dark:bg-black border border-black dark:border-white">
            <DialogHeader>
              <DialogTitle>
                {dialogType === "delete"
                  ? "Delete Blog Post"
                  : "Edit Blog Post"}
              </DialogTitle>
              <DialogDescription>
                {dialogType === "delete"
                  ? "Are you sure you want to delete this blog post? This action cannot be undone."
                  : "You are about to edit this blog post."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={dialogType === "delete" ? "destructive" : "default"}
                onClick={() => {
                  if (selectedBlog) {
                    if (dialogType === "delete") {
                      BlogModel.delete(selectedBlog.id);
                      setBlogPosts((posts) =>
                        posts.filter((p) => p.id !== selectedBlog.id)
                      );
                    } else {
                      router.push(`/blog/editblog?id=${selectedBlog.id}`);
                    }
                  }
                  setDialogOpen(false);
                }}
              >
                {dialogType === "delete" ? "Delete" : "Edit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Blog;
