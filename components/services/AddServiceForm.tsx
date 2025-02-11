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
      name: "",
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

  const handleFileSelect = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [index]: file }));
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews((prev) => ({ ...prev, [index]: previewUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure price is a number before saving
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue < 0) {
        throw new Error("Please enter a valid price");
      }

      // Instead of uploading to Firebase storage, we'll just use the image URLs directly
      const finalImages = images
        .map((img) => {
          return img.url ? {
            url: img.url,
            alt: img.alt || 'Service image',
            isPrimary: img.isPrimary
          } : null;
        })
        .filter(Boolean);

      if (finalImages.length === 0) {
        throw new Error("At least one image URL is required");
      }

      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: priceValue,
        category: formData.category,
        details: formData.details,
        features: formData.features.split(",").filter((f) => f.trim()),
        rating: 0,
        totalReviews: 0,
        reviews: [],
        images: finalImages,
        provider: formData.provider,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "services"), serviceData);

      toast({
        title: "Service added successfully",
        description: `Service added with price: ₹${priceValue}`,
      });
      onServiceAdded();
      onClose();
    } catch (err) {
      console.error("Error adding service:", err);
      toast({
        title: "Error adding service",
        description:
          err instanceof Error ? err.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add New Service
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Enter service description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value, // This will be converted to number later
                })
              }
              required
              placeholder="Enter price"
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="">Select category</option>
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="carpenter">Carpenter</option>
              <option value="bathroom_kitchen_cleaning">
                Bathroom & Kitchen Cleaning
              </option>
              <option value="sofa_carpet_cleaning">
                Sofa & Carpet Cleaning
              </option>
              <option value="ac_repair">AC Repair & Services</option>
              <option value="chimney_repair">Chimney Repair</option>
              <option value="water_purifier_repair">
                Water Purifier Repair
              </option>
              <option value="microwave_repair">Microwave Repair</option>
              <option value="refrigerator_repair">Refrigerator Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Details</label>
            <Textarea
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Enter additional details"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Service Provider Name
            </label>
            <Input
              value={formData.provider.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  provider: {
                    ...formData.provider,
                    name: e.target.value,
                  },
                })
              }
              required
              placeholder="Enter service provider name"
              className="w-full"
            />
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold">Features</label>
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Service Images</h2>
            <p className="text-sm text-muted-foreground">
              Add up to 5 images for your service
            </p>

            {images.map((image, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-4 relative"
              >
                {/* Add remove button */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                )}

                {/* URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <input
                    type="text"
                    value={image.url}
                    onChange={(e) => updateImage(index, "url", e.target.value)}
                    placeholder="Enter image URL"
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Alt Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alt Text</label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(index, "alt", e.target.value)}
                    placeholder="Describe the image"
                    className="w-full p-2 border rounded"
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
                  <label className="text-sm">Primary Image</label>
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceForm;
