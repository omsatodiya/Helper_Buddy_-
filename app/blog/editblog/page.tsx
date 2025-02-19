"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BlogModel } from "../BlogModel";
import gsap from "gsap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  User,
  FileText,
  Tags,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminProtected from "@/components/auth/AdminProtected";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { validateImage } from "@/lib/imageUtils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const tags = ["Beauty", "Lifestyle", "Homepage", "Fashion", "Health", "Food"];

interface FormData {
  title: string;
  author: string;
  readTime: string;
  description: string;
  imageUrl: string;
  tags: string[];
  fullDescription: string;
  publishedDate: string;
  imageFile: File | null;
  currentImageUrl: string;
  [key: string]: string | string[] | File | null;
}

const EditBlog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams?.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    readTime: "",
    description: "",
    imageUrl: "",
    tags: [],
    fullDescription: "",
    publishedDate: new Date().toISOString(),
    imageFile: null,
    currentImageUrl: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTag, setNewTag] = useState("");

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ["title", "author", "readTime"];
      case 2:
        return ["imageFile", "tags"];
      case 3:
        return ["description", "fullDescription"];
      default:
        return [];
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<(HTMLDivElement | null)[]>([]);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial page load animation
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(".header-content > *", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out",
      });

      gsap.from(formRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: 0.4,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) {
        router.push("/blog");
        return;
      }

      try {
        const blogData = await BlogModel.getById(blogId);
        if (!blogData) {
          throw new Error("Blog not found");
        }

        const initialData = {
          title: blogData.title || "",
          author: blogData.author || "",
          readTime: (blogData.readTime || "").replace(/[^0-9]/g, ""),
          description: blogData.description || "",
          imageUrl: blogData.imageUrl || "",
          tags: Array.isArray(blogData.tags) ? blogData.tags : [],
          fullDescription: blogData.fullDescription || "",
          publishedDate: blogData.publishedDate || new Date().toISOString(),
          imageFile: null,
          currentImageUrl: blogData.imageUrl || "",
        };
        setOriginalData(initialData);
        setFormData(initialData);
      } catch (error) {
        console.error("Fetch error:", error);
        router.push("/blog");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blogId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "readTime") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const handleTagHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleTagLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImage(file);
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        currentImageUrl: URL.createObjectURL(file),
      }));

      // Clear any existing errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        return newErrors;
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        imageFile: error instanceof Error ? error.message : "Invalid file",
      }));
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const currentFields = getCurrentStepFields();
    const newErrors: { [key: string]: string } = {};

    currentFields.forEach((field) => {
      const value = formData[field as keyof typeof formData];
      if (field === "tags") {
        if (formData.tags.length === 0) {
          newErrors.tags = "Please select at least one tag";
        }
      } else if (typeof value === "string" && !value.trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!blogId || isSubmitting) return;

    const currentFields = getCurrentStepFields();
    const newErrors: { [key: string]: string } = {};

    // Validate all fields from all steps before submission
    const allFields = [
      "title",
      "author",
      "readTime",
      "tags",
      "description",
      "fullDescription",
    ];

    allFields.forEach((field) => {
      const value = formData[field as keyof typeof formData];
      if (field === "tags") {
        if (formData.tags.length === 0) {
          newErrors.tags = "Please select at least one tag";
        }
      } else if (typeof value === "string" && !value.trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Show dialog instead of submitting directly
    setDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!blogId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let imageUrl = formData.currentImageUrl;

      if (formData.imageFile) {
        imageUrl = await uploadToCloudinary(formData.imageFile);
      }

      const blogData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        readTime: `${formData.readTime.trim()} min read`,
        tags: formData.tags,
        imageUrl,
        updatedAt: new Date().toISOString(),
      };

      await BlogModel.update(blogId, blogData);
      router.push("/blog");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setErrors((prev) => ({
        ...prev,
        submit:
          error instanceof Error ? error.message : "Failed to update blog",
      }));
      setIsSubmitting(false);
      setDialogOpen(false);
    }
  };

  const getChangedFields = () => {
    if (!originalData) return [];

    return Object.entries(formData).reduce(
      (changes: string[], [key, value]) => {
        // Special handling for image changes
        if (key === "imageFile" && value) {
          changes.push("image");
          return changes;
        }

        // Handle arrays (like tags)
        if (Array.isArray(value)) {
          if (JSON.stringify(value) !== JSON.stringify(originalData[key])) {
            changes.push(key);
          }
        }
        // Handle strings and other values
        else if (
          value !== originalData[key] &&
          key !== "imageFile" &&
          key !== "currentImageUrl"
        ) {
          changes.push(key);
        }
        return changes;
      },
      []
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center">
        <div className="w-12 h-12 border-2 border-t-transparent border-black dark:border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputStyles =
    "w-full px-4 py-3 rounded-xl border border-black dark:border-white focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50 transition-all bg-white dark:bg-black text-black dark:text-white";
  const labelStyles =
    "text-sm font-medium text-black dark:text-white flex items-center gap-2";
  const tagStyles = (isSelected: boolean) =>
    cn(
      "px-4 py-2 rounded-full text-sm font-medium transition-all",
      isSelected
        ? "bg-black dark:bg-white text-white dark:text-black"
        : "border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
    );

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
                className={inputStyles}
                placeholder="Enter an engaging title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <User className="w-4 h-4" />
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={inputStyles}
                placeholder="Your name"
              />
              {errors.author && (
                <p className="text-sm text-red-500 mt-1">{errors.author}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Clock className="w-4 h-4" />
                Read Time (in minutes) *
              </label>
              <input
                type="text"
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                className={inputStyles}
                placeholder="5"
              />
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
                Cover Image
              </label>
              <div className="space-y-4">
                {formData.currentImageUrl && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <img
                      src={formData.currentImageUrl}
                      alt="Current cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

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
                {errors.imageFile && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.imageFile}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>
                <Tags className="w-4 h-4" />
                Tags *
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
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
              <label className={labelStyles}>Short Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={inputStyles}
                placeholder="Write a brief description"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>Full Content *</label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={8}
                className={inputStyles}
                placeholder="Write your blog post content"
              />
              {errors.fullDescription && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fullDescription}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white dark:bg-black py-12"
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/blogs")}
            className="hover:bg-transparent p-0 h-auto"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Blog Post</h1>
        </div>

        <div
          ref={formRef}
          className="bg-white dark:bg-black rounded-2xl shadow-xl border border-black dark:border-white p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderStepContent()}

            {/* Step Navigation and Action Buttons */}
            <div className="flex flex-col border-t border-black dark:border-white pt-6">
              {/* Progress Dots */}
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i + 1 === currentStep
                        ? "bg-black dark:bg-white"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-3">
                {currentStep < totalSteps ? (
                  <>
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        className="w-full bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-black dark:bg-white text-white dark:text-black"
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="w-full bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black dark:bg-white text-white dark:text-black disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update Blog Post"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black rounded-2xl p-4 sm:p-6 border border-black dark:border-white overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              Update Blog Post
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white opacity-75 mt-2 text-sm sm:text-base">
              {getChangedFields().length > 0
                ? "The following fields will be updated:"
                : "No changes have been made to the blog post."}
            </DialogDescription>
          </DialogHeader>

          {getChangedFields().length > 0 && (
            <div className="py-4 border-t border-b border-black dark:border-white">
              <h4 className="font-medium text-black dark:text-white mb-2">
                Changed fields:
              </h4>
              <ul className="mt-2 text-sm text-black dark:text-white opacity-75 space-y-2">
                {getChangedFields().map((field) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-black dark:bg-white rounded-full"></span>
                    <span className="capitalize">
                      {field === "readTime"
                        ? "Read Time"
                        : field === "imageUrl"
                        ? "Image"
                        : field === "fullDescription"
                        ? "Full Content"
                        : field}
                    </span>
                    {field !== "tags" && field !== "imageUrl" && (
                      <span className="text-xs opacity-50">
                        {originalData?.[field]
                          ? `(${String(originalData[field]).substring(
                              0,
                              20
                            )}... → ${String(formData[field]).substring(
                              0,
                              20
                            )}...)`
                          : ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto border-black dark:border-white"
            >
              Cancel
            </Button>
            {getChangedFields().length > 0 && (
              <Button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Confirm Update"}
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
