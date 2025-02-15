import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { ServiceImage } from "@/types/service";
import { ImagePlus, X, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface AddServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

const AddServiceForm = ({
  isOpen,
  onClose,
  onServiceAdded,
}: AddServiceFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    details: "",
    features: "",
    rating: 0,
    totalReviews: 0,
    reviews: [],
    images: [
      {
        url: "/api/placeholder/400/300",
        alt: "Service Image",
        isPrimary: true,
      },
    ],
    provider: {
      id: `provider-${Date.now()}`,
      email: "provider@example.com",
      phone: "+1234567890",
      rating: 0,
      totalServices: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [images, setImages] = useState<
    { url: string; alt: string; isPrimary: boolean }[]
  >([{ url: "", alt: "", isPrimary: true }]);

  const [features, setFeatures] = useState<string[]>([""]);

  const [selectedFiles, setSelectedFiles] = useState<{ [key: number]: File }>(
    {}
  );
  const [filePreviews, setFilePreviews] = useState<{ [key: number]: string }>(
    {}
  );

  // Add form ref
  const formRef = React.useRef<HTMLFormElement>(null);

  const isValid = () => {
    return images.length > 0 && images.every((img) => img.url.trim() !== "");
  };

  const addImageField = () => {
    setImages([...images, { url: "", alt: "", isPrimary: false }]);
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      if (images[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      setImages(newImages);

      // Clean up file preview and selected file
      const newFilePreviews = { ...filePreviews };
      const newSelectedFiles = { ...selectedFiles };
      delete newFilePreviews[index];
      delete newSelectedFiles[index];
      setFilePreviews(newFilePreviews);
      setSelectedFiles(newSelectedFiles);
    }
  };

  const updateImage = (
    index: number,
    field: keyof ServiceImage,
    value: string | boolean
  ) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [index]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Store file for upload
      setSelectedFiles((prev) => ({
        ...prev,
        [index]: file,
      }));

      // Upload to Cloudinary immediately
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Update image URL in state
      const newImages = [...images];
      newImages[index] = {
        ...newImages[index],
        url: cloudinaryUrl,
        alt: file.name,
      };
      setImages(newImages);
    } catch (error) {
      console.error("Error handling file:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.description ||
        !formData.price ||
        !formData.category
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Upload images to Cloudinary
      const uploadPromises = Object.entries(selectedFiles).map(
        async ([index, file]) => {
          const cloudinaryUrl = await uploadToCloudinary(file);
          return {
            url: cloudinaryUrl,
            alt: images[Number(index)].alt || formData.name,
            isPrimary: images[Number(index)].isPrimary,
          };
        }
      );

      const uploadedImages = await Promise.all(uploadPromises);

      // Combine uploaded images with existing image URLs
      const finalImages = images
        .map((img, index) => {
          if (selectedFiles[index]) {
            return uploadedImages.find(
              (uploaded) => uploaded.alt === (img.alt || formData.name)
            );
          }
          return img.url ? img : null;
        })
        .filter((img): img is ServiceImage => img !== null);

      if (finalImages.length === 0) {
        throw new Error("At least one image is required");
      }

      // Prepare service data
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        details: formData.details.trim(),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f !== ""),
        rating: 0,
        totalReviews: 0,
        reviews: [],
        images: finalImages,
        provider: {
          ...formData.provider,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "services"), serviceData);

      toast({
        title: "Success",
        description: "Service added successfully",
      });

      // Reset form and state
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        details: "",
        features: "",
        rating: 0,
        totalReviews: 0,
        reviews: [],
        images: [{ url: "", alt: "", isPrimary: true }],
        provider: {
          id: `provider-${Date.now()}`,
          email: "provider@example.com",
          phone: "+1234567890",
          rating: 0,
          totalServices: 0,
        },
      });
      setImages([{ url: "", alt: "", isPrimary: true }]);
      setSelectedFiles({});
      setFilePreviews({});

      onServiceAdded();
      onClose();
    } catch (err) {
      console.error("Error adding service:", err);
      setError(err instanceof Error ? err.message : "Failed to add service");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Replace the category select element with updated categories
  const serviceCategories = [
    { id: 'Cleaning', name: 'Cleaning & Maintenance' },
    { id: 'Plumbing', name: 'Plumbing' },
    { id: 'Carpentry', name: 'Carpentry' },
    { id: 'Electrical', name: 'Electrical' },
    { id: 'AC', name: 'AC Repair & Services' },
    { id: 'Chimney', name: 'Chimney Repair' },
    { id: 'Water Purifier', name: 'Water Purifier Repair' },
    { id: 'Microwave', name: 'Microwave Repair' },
    { id: 'Refrigerator', name: 'Refrigerator Repair' },
    { id: 'TV', name: 'TV Repair' },
    { id: 'Washing Machine', name: 'Washing Machine Repair' },
    { id: 'Geyser', name: 'Geyser Repair' },
    { id: 'Painting', name: 'Painting & Decoration' },
    { id: 'Carpets', name: 'Carpets & Flooring' },
    { id: 'Furniture', name: 'Furniture Repair & Assembly' },
    { id: 'Home Appliances', name: 'Home Appliances Repair' },
    { id: 'Fans', name: 'Fans Repair' },
    { id: 'Fan Cleaning', name: 'Fan Cleaning' },
    { id: 'Home Cleaning', name: 'Home Cleaning' },
    { id: 'Home Security', name: 'Home Security' },
    { id: 'Home Maintenance', name: 'Home Maintenance' },
    { id: 'Home Repair', name: 'Home Repair' },
    { id: 'Home Renovation', name: 'Home Renovation' },
    { id: 'Landscaping', name: 'Landscaping & Gardening' },
    { id: 'Moving', name: 'Moving & Transportation' },
    { id: 'Tutoring', name: 'Tutoring & Education' },
    { id: 'Wellness', name: 'Health & Wellness' },
    { id: 'Events', name: 'Events & Entertainment' },
    { id: 'Technology', name: 'Technology & IT' },
    { id: 'Pets', name: 'Pet Services' },
    { id: 'Beauty', name: 'Beauty & Personal Care' },
    { id: 'Automotive', name: 'Automotive' },
    { id: 'Legal', name: 'Legal Services' },
    { id: 'Financial', name: 'Financial Services' },
    { id: 'Creative', name: 'Creative & Design' },
    { id: 'Other', name: 'Other Services' }
  ];

  return (
    <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Basic Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Service Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Enter service name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₹)
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                placeholder="Enter price"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            placeholder="Enter service description"
            className="h-32"
          />
        </div>

        {/* Category and Provider */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-black dark:text-white">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
            className="w-full rounded-md border border-black/10 dark:border-white/10 p-2 bg-white dark:bg-black text-black dark:text-white"
          >
            <option value="">Select category</option>
            {serviceCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Details */}
        <div className="space-y-4 md:col-span-2">
          <label className="block text-sm font-medium text-black dark:text-white">
            Details
          </label>
          <Textarea
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
            placeholder="Enter additional details"
            className="h-32 bg-white dark:bg-black border-black/10 dark:border-white/10"
          />
        </div>

        {/* Features Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Features
          </h3>
          <div className="space-y-3">
            {formData.features.split(",").map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features.split(",")];
                    newFeatures[index] = e.target.value;
                    setFormData({
                      ...formData,
                      features: newFeatures.join(","),
                    });
                  }}
                  placeholder="Enter a feature"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    const newFeatures = formData.features
                      .split(",")
                      .filter((_, i) => i !== index);
                    setFormData({
                      ...formData,
                      features: newFeatures.join(","),
                    });
                  }}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  features: [...formData.features.split(","), ""].join(","),
                })
              }
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </Button>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Service Images
          </h3>
          <p className="text-sm text-black/70 dark:text-white/70">
            Add up to 5 images for your service
          </p>
          {images.map((image, index) => (
            <div
              key={index}
              className="p-4 border border-black/10 dark:border-white/10 rounded-lg space-y-4 relative bg-white dark:bg-black"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  className="w-full p-2 border border-black/10 dark:border-white/10 rounded bg-white dark:bg-black text-black dark:text-white"
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => updateImage(index, "alt", e.target.value)}
                  placeholder="Describe the image"
                  className="w-full p-2 border border-black/10 dark:border-white/10 rounded bg-white dark:bg-black text-black dark:text-white"
                />
              </div>

              {/* Primary Image Radio */}
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={image.isPrimary}
                  onChange={() => {
                    const newImages = images.map((img, i) => ({
                      ...img,
                      isPrimary: i === index,
                    }));
                    setImages(newImages);
                  }}
                  className="rounded"
                />
                <label className="text-sm text-black dark:text-white">
                  Primary Image
                </label>
              </div>
            </div>
          ))}

          {/* Add Image Button */}
          {images.length < 5 && (
            <Button
              type="button"
              variant="outline"
              onClick={addImageField}
              className="w-full py-6 border-dashed flex items-center gap-2 hover:border-primary"
            >
              <ImagePlus className="w-5 h-5" />
              Add Another Image
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-white dark:bg-black border border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-black/10 dark:border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-black dark:border-white text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent"></div>
              Adding...
            </div>
          ) : (
            "Add Service"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddServiceForm;
