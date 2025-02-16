"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface AddServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

const STEPS = {
  BASIC_INFO: 0,
  DETAILS: 1,
  FEATURES_AND_IMAGES: 2,
};

export default function AddServiceForm({
  isOpen,
  onClose,
  onServiceAdded,
}: AddServiceFormProps) {
  const [step, setStep] = useState(STEPS.BASIC_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    details: "",
    features: "",
    provider: {
      name: "",
      id: `provider-${Date.now()}`,
      email: "provider@example.com",
      phone: "+1234567890",
      rating: 0,
      totalServices: 0,
    },
    images: [{ url: "", alt: "", isPrimary: true }],
  });

  const [selectedFiles, setSelectedFiles] = useState<{ [key: number]: File }>(
    {}
  );
  const [filePreviews, setFilePreviews] = useState<{ [key: number]: string }>(
    {}
  );

  const handleNext = () => {
    if (step < STEPS.FEATURES_AND_IMAGES) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > STEPS.BASIC_INFO) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only proceed with submission if we're on the last step
    if (step !== STEPS.FEATURES_AND_IMAGES) {
      handleNext();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload images to Cloudinary
      const uploadPromises = Object.entries(selectedFiles).map(
        async ([index, file]) => {
          const cloudinaryUrl = await uploadToCloudinary(file);
          return {
            url: cloudinaryUrl,
            alt: formData.images[Number(index)].alt || formData.name,
            isPrimary: formData.images[Number(index)].isPrimary,
          };
        }
      );

      const uploadedImages = await Promise.all(uploadPromises);

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
        images: uploadedImages,
        provider: {
          ...formData.provider,
          name: formData.provider.name.trim(),
        },
        rating: 0,
        totalReviews: 0,
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to Firestore
      await addDoc(collection(db, "services"), serviceData);

      toast({
        title: "Success",
        description: "Service added successfully",
      });

      onServiceAdded();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add service"
      );
    } finally {
      setLoading(false);
    }
  };

  // Replace the category select element with updated categories
  const serviceCategories = [
    { id: "Cleaning", name: "Cleaning & Maintenance" },
    { id: "Plumbing", name: "Plumbing" },
    { id: "Carpentry", name: "Carpentry" },
    { id: "Electrical", name: "Electrical" },
    { id: "AC", name: "AC Repair & Services" },
    { id: "Chimney", name: "Chimney Repair" },
    { id: "Water Purifier", name: "Water Purifier Repair" },
    { id: "Microwave", name: "Microwave Repair" },
    { id: "Refrigerator", name: "Refrigerator Repair" },
    { id: "TV", name: "TV Repair" },
    { id: "Washing Machine", name: "Washing Machine Repair" },
    { id: "Geyser", name: "Geyser Repair" },
    { id: "Painting", name: "Painting & Decoration" },
    { id: "Carpets", name: "Carpets & Flooring" },
    { id: "Furniture", name: "Furniture Repair & Assembly" },
    { id: "Home Appliances", name: "Home Appliances Repair" },
    { id: "Fans", name: "Fans Repair" },
    { id: "Fan Cleaning", name: "Fan Cleaning" },
    { id: "Home Cleaning", name: "Home Cleaning" },
    { id: "Home Security", name: "Home Security" },
    { id: "Home Maintenance", name: "Home Maintenance" },
    { id: "Home Repair", name: "Home Repair" },
    { id: "Home Renovation", name: "Home Renovation" },
    { id: "Landscaping", name: "Landscaping & Gardening" },
    { id: "Moving", name: "Moving & Transportation" },
    { id: "Tutoring", name: "Tutoring & Education" },
    { id: "Wellness", name: "Health & Wellness" },
    { id: "Events", name: "Events & Entertainment" },
    { id: "Technology", name: "Technology & IT" },
    { id: "Pets", name: "Pet Services" },
    { id: "Beauty", name: "Beauty & Personal Care" },
    { id: "Automotive", name: "Automotive" },
    { id: "Legal", name: "Legal Services" },
    { id: "Financial", name: "Financial Services" },
    { id: "Creative", name: "Creative & Design" },
    { id: "Other", name: "Other Services" },
  ];

  const renderStepContent = () => {
    switch (step) {
      case STEPS.BASIC_INFO:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
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
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  className="w-full rounded-md border p-2"
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
                  <option value="refrigerator_repair">
                    Refrigerator Repair
                  </option>
                </select>
              </div>
            </div>
          </div>
        );

      case STEPS.DETAILS:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Service Details</h2>
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
                className="h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Additional Details
              </label>
              <Textarea
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                placeholder="Enter additional details"
                className="h-32"
              />
            </div>
          </div>
        );

      case STEPS.FEATURES_AND_IMAGES:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Service Features</h2>
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
                      onClick={() => {
                        const newFeatures = formData.features
                          .split(",")
                          .filter((_, i) => i !== index);
                        setFormData({
                          ...formData,
                          features: newFeatures.join(","),
                        });
                      }}
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
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Service Images</h2>
              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFiles((prev) => ({
                            ...prev,
                            [index]: file,
                          }));
                          setFilePreviews((prev) => ({
                            ...prev,
                            [index]: URL.createObjectURL(file),
                          }));
                        }
                      }}
                    />
                    {filePreviews[index] && (
                      <img
                        src={filePreviews[index]}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
                {formData.images.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        images: [
                          ...formData.images,
                          { url: "", alt: "", isPrimary: false },
                        ],
                      })
                    }
                    className="w-full"
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Add Another Image
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {renderStepContent()}

      {error && (
        <div className="bg-red-50 border border-red-500 text-red-500 p-4 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={step === STEPS.BASIC_INFO ? onClose : handleBack}
        >
          {step === STEPS.BASIC_INFO ? "Cancel" : "Back"}
        </Button>

        <Button type="submit" disabled={loading}>
          {step === STEPS.FEATURES_AND_IMAGES
            ? loading
              ? "Adding..."
              : "Add Service"
            : "Next"}
        </Button>
      </div>
    </form>
  );
}
