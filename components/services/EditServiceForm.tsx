"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Plus } from "lucide-react";
import { db } from "@/lib/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Service } from "@/types/service";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadToCloudinary } from "@/lib/cloudinary";

const STEPS = {
  BASIC_INFO: 0,
  DETAILS: 1,
  FEATURES_AND_IMAGES: 2,
};

const STEP_TITLES = ["Basic Info", "Details", "Features & Images"];

interface EditServiceFormProps {
  service: Service;
  onClose: () => void;
  onServiceUpdated: (service: Service) => void;
}

export default function EditServiceForm({
  service,
  onClose,
  onServiceUpdated,
}: EditServiceFormProps) {
  const [step, setStep] = useState(STEPS.BASIC_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: service.name || "",
    price: service.price || 0,
    description: service.description || "",
    details: service.details || "",
    category: service.category || "uncategorized",
    features: Array.isArray(service.features)
      ? service.features.filter((feature) => feature?.trim()).join(",")
      : typeof service.features === "string"
      ? service.features
      : "",
    images: service.images?.length
      ? service.images
      : [{ url: "", alt: "", isPrimary: true }],
    provider: service.provider || {
      id: `provider-${Date.now()}`,
      name: "",
      email: "provider@example.com",
      phone: "+1234567890",
      rating: 0,
      totalServices: 0,
    },
  });

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

    if (step !== STEPS.FEATURES_AND_IMAGES) {
      handleNext();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const serviceRef = doc(db, "services", service.id);
      const updatedService = {
        name: formData.name?.trim() || "",
        description: formData.description?.trim() || "",
        price: parseFloat(formData.price?.toString() || "0"),
        category: formData.category || "uncategorized",
        details: formData.details?.trim() || "",
        features: formData.features
          ? formData.features
              .split(",")
              .map((f) => f.trim())
              .filter((f) => f !== "")
          : [],
        images: formData.images || [],
        provider: {
          ...formData.provider,
          name: formData.provider?.name?.trim() || "",
        },
        updatedAt: new Date(),
      };

      await updateDoc(serviceRef, updatedService);

      toast({
        title: "Success",
        description: "Service updated successfully",
      });

      onServiceUpdated({
        ...service,
        ...updatedService,
        id: service.id,
        createdAt: service.createdAt,
        updatedAt: new Date(),
      });

      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update service"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case STEPS.BASIC_INFO:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div>
              <Label className="font-medium mb-1.5">Service Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter service name"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label className="font-medium mb-1.5">Price (₹)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                placeholder="Enter price"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label className="font-medium mb-1.5">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrician">Electrician</SelectItem>
                  <SelectItem value="Plumber">Plumber</SelectItem>
                  <SelectItem value="Carpenter">Carpenter</SelectItem>
                  <SelectItem value="Bathroom Kitchen Cleaning">
                    Bathroom & Kitchen Cleaning
                  </SelectItem>
                  <SelectItem value="Sofa Carpet Cleaning">
                    Sofa & Carpet Cleaning
                  </SelectItem>
                  <SelectItem value="AC Repair">
                    AC Repair & Services
                  </SelectItem>
                  <SelectItem value="Chimney Repair">Chimney Repair</SelectItem>
                  <SelectItem value="Water Purifier Repair">
                    Water Purifier Repair
                  </SelectItem>
                  <SelectItem value="Microwave Repair">
                    Microwave Repair
                  </SelectItem>
                  <SelectItem value="Refrigerator Repair">
                    Refrigerator Repair
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case STEPS.DETAILS:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Service Details</h2>
            <div>
              <Label className="font-medium mb-1.5">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter service description"
                className="mt-1.5 min-h-[100px]"
                required
              />
            </div>
            <div>
              <Label className="font-medium mb-1.5">Additional Details</Label>
              <Textarea
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                placeholder="Enter additional details"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
          </div>
        );

      case STEPS.FEATURES_AND_IMAGES:
        return (
          <div className="space-y-8">
            <div>
              <Label className="font-medium mb-1.5">Features</Label>
              <div className="space-y-2">
                {renderFeatures()}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      features: [...formData.features.split(","), ""].join(","),
                    })
                  }
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Feature
                </Button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="font-medium">Service Images</Label>
                <span className="text-sm text-gray-500">
                  Add up to 5 images for your service
                </span>
              </div>

              {formData.images.map((image, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            try {
                              const url = await uploadToCloudinary(
                                e.target.files[0]
                              );
                              const newImages = formData.images.map((img, i) =>
                                i === index ? { ...img, url } : img
                              );
                              setFormData({ ...formData, images: newImages });
                            } catch (error) {
                              console.error("Error uploading image:", error);
                              toast({
                                title: "Error",
                                description: "Failed to upload image",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                        className="mt-1"
                      />
                      {image.url && (
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="mt-2 h-24 w-24 object-cover rounded"
                        />
                      )}
                    </div>

                    <div>
                      <Label className="text-sm">Alt Text</Label>
                      <Input
                        value={image.alt}
                        onChange={(e) => {
                          const newImages = formData.images.map((img, i) =>
                            i === index ? { ...img, alt: e.target.value } : img
                          );
                          setFormData({ ...formData, images: newImages });
                        }}
                        placeholder="Describe the image"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`primary-${index}`}
                        checked={image.isPrimary}
                        onChange={() => {
                          const newImages = formData.images.map((img, i) =>
                            i === index
                              ? { ...img, isPrimary: true }
                              : { ...img, isPrimary: false }
                          );
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor={`primary-${index}`}
                        className="text-sm font-normal"
                      >
                        Primary Image
                      </Label>
                    </div>
                  </div>
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
                      ].slice(0, 5),
                    })
                  }
                  className="w-full"
                >
                  Add Another Image
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  const renderFeatures = () => {
    return (formData.features || "")
      .split(",")
      .filter(Boolean)
      .map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={feature}
            onChange={(e) => {
              const newFeatures = formData.features
                .split(",")
                .map((f, i) => (i === index ? e.target.value : f));
              setFormData({
                ...formData,
                features: newFeatures.join(","),
              });
            }}
            placeholder="Enter a feature"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const newFeatures = formData.features
                .split(",")
                .filter((_, i) => i !== index);
              setFormData({
                ...formData,
                features: newFeatures.join(","),
              });
            }}
            className="px-2 text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Bar */}
      <div className="relative mb-12">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 w-full">
          <div className="h-[1px] w-full bg-gray-200">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${(step / (Object.keys(STEPS).length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {STEP_TITLES.map((title, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${
                    step >= index
                      ? "bg-black text-white"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  }
                  transition-all duration-300 z-10`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-sm whitespace-nowrap
                  ${step >= index ? "text-black font-medium" : "text-gray-400"}
                  transition-all duration-300`}
              >
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      {renderStepContent()}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-500 text-red-500 p-4 rounded">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
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
              ? "Updating..."
              : "Update Service"
            : "Next"}
        </Button>
      </div>
    </form>
  );
}
