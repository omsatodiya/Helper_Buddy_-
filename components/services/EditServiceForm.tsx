import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Service } from "@/types/service";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface EditServiceFormProps {
  service: Service;
  onClose: () => void;
  onServiceUpdated: (updatedService: Service) => void;
}

const EditServiceForm = ({
  service,
  onClose,
  onServiceUpdated,
}: EditServiceFormProps) => {
  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description,
    price: service.price,
    category: service.category,
    details: service.details || "",
    features: service.features || [],
    images: service.images || [
      {
        url: "",
        alt: "",
        isPrimary: true,
      },
    ],
    provider: service.provider || {
      id: `provider-${Date.now()}`,
      name: "",
      email: "provider@example.com",
      phone: "+1234567890",
      rating: 0,
      totalServices: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addImage = () => {
    if (formData.images.length < 5) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, { url: "", alt: "", isPrimary: false }],
      }));
    }
  };

  const updateImage = (
    index: number,
    field: "url" | "alt" | "isPrimary",
    value: string | boolean
  ) => {
    const newImages = formData.images.map((img, i) => {
      if (i === index) {
        return { ...img, [field]: value };
      }
      if (field === "isPrimary" && value === true) {
        return { ...img, isPrimary: false };
      }
      return img;
    });
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceRef = doc(db, "services", service.id);
      const updatedService = {
        ...service,
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(serviceRef, updatedService);

      onServiceUpdated({
        ...updatedService,
        id: service.id,
      });

      onClose();
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error updating service",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="font-medium mb-1.5">Service Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter service name"
          className="mt-1.5"
          required
        />
      </div>

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
        <Label className="font-medium mb-1.5">Price (₹)</Label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
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
            <SelectItem value="electrician">Electrician</SelectItem>
            <SelectItem value="plumber">Plumber</SelectItem>
            <SelectItem value="carpenter">Carpenter</SelectItem>
            <SelectItem value="bathroom_kitchen_cleaning">
              Bathroom & Kitchen Cleaning
            </SelectItem>
            <SelectItem value="sofa_carpet_cleaning">
              Sofa & Carpet Cleaning
            </SelectItem>
            <SelectItem value="ac_repair">AC Repair & Services</SelectItem>
            <SelectItem value="chimney_repair">Chimney Repair</SelectItem>
            <SelectItem value="water_purifier_repair">
              Water Purifier Repair
            </SelectItem>
            <SelectItem value="microwave_repair">Microwave Repair</SelectItem>
            <SelectItem value="refrigerator_repair">
              Refrigerator Repair
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-medium mb-1.5">Details</Label>
        <Textarea
          value={formData.details}
          onChange={(e) =>
            setFormData({ ...formData, details: e.target.value })
          }
          placeholder="Enter additional details"
          className="mt-1.5 min-h-[100px]"
        />
      </div>

      <div>
        <Label className="font-medium mb-1.5">Features</Label>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Enter a feature"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFeature(index)}
                className="px-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addFeature}
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
                <Label className="text-sm">Image URL</Label>
                <Input
                  value={image.url}
                  onChange={(e) => updateImage(index, "url", e.target.value)}
                  placeholder="Enter image URL"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Alt Text</Label>
                <Input
                  value={image.alt}
                  onChange={(e) => updateImage(index, "alt", e.target.value)}
                  placeholder="Describe the image"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`primary-${index}`}
                  checked={image.isPrimary}
                  onChange={() => updateImage(index, "isPrimary", true)}
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
            onClick={addImage}
            className="w-full"
          >
            Add Another Image
          </Button>
        )}
      </div>

      <div>
        <Label className="font-medium mb-1.5">Service Provider Name</Label>
        <Input
          value={formData.provider?.name || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              provider: {
                ...(formData.provider || {}),
                name: e.target.value,
              },
            })
          }
          placeholder="Enter service provider name"
          className="mt-1.5"
          required
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Service"}
        </Button>
      </div>
    </form>
  );
};

export default EditServiceForm;
