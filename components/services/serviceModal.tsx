import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Star,
  Clock,
  User,
  HelpCircle,
  Trash2,
  X,
  Edit2,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Service } from "@/types/service";
import AddReviewModal from "./AddReviewModal";
import { useToast } from "../../hooks/use-toast";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import ServiceProviderCard from "./ServiceProviderCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import EditServiceForm from "./EditServiceForm";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalServices: number;
}

interface ServiceReview {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  userName: string;
  userEmail: string;
  date: string;
  helpful: number;
  reply?: {
    comment: string;
    date: string;
  };
}

interface ServiceImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ServicePricing {
  basePrice: number;
  discountedPrice?: number;
  unit: "per_hour" | "fixed" | "per_day";
  minimumCharge?: number;
  additionalCharges?: {
    name: string;
    amount: number;
    description?: string;
  }[];
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  isAdminView?: boolean;
  onServiceDeleted?: () => void;
  onReviewAdded?: (updatedService: Service) => void;
  onServiceUpdated?: (updatedService: Service) => void;
}

const ServiceModal = ({
  isOpen,
  onClose,
  service,
  isAdminView = false,
  onServiceDeleted,
  onReviewAdded,
  onServiceUpdated,
}: ServiceModalProps) => {
  const [selectedImage, setSelectedImage] = useState(
    service.images?.[0]?.url || "/placeholder-image.jpg"
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { toast } = useToast();
  const [localService, setLocalService] = useState(service);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    setLocalService(service);
  }, [service]);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ));
  };

  const formatServiceTime = () => {
    if (!service.serviceTime) return "Duration not specified";
    const { duration, unit } = service.serviceTime;
    return `${duration} ${unit}`;
  };
  const formatPrice = () => {
    if (!service.price) return "₹0"; // Use simple price field
    return `₹${service.price.toLocaleString("en-IN")}${
      service.pricing?.unit === "per_hour"
        ? "/hr"
        : service.pricing?.unit === "per_day"
        ? "/day"
        : ""
    }`;
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "services", service.id));
      toast({
        title: "Service deleted successfully",
        variant: "default",
      });
      onClose();
      onServiceDeleted?.();
    } catch (error) {
      toast({
        title: "Error deleting service",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleReviewClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to write a review",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = `/auth/signin?redirect=${window.location.pathname}`;
            }}
          >
            Sign In
          </Button>
        ),
      });
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleReviewAdded = async (newReview: ServiceReview) => {
    try {
      if (!user) {
        throw new Error("Must be logged in to add review");
      }

      // Create review with user data
      const reviewWithUserData = {
        ...newReview,
        userName: user.displayName || "User", // Fallback if no display name
        userEmail: user.email || "",
        date: new Date().toISOString(),
        id: crypto.randomUUID(), // Generate unique ID
      };

      // Calculate new rating
      const allReviews = [...(localService.reviews || []), reviewWithUserData];
      const totalRating = allReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const newRating = totalRating / allReviews.length;

      // Update local state
      const updatedService = {
        ...localService,
        reviews: allReviews,
        rating: newRating,
        totalReviews: allReviews.length,
      };

      setLocalService(updatedService);
      onReviewAdded?.(updatedService);

      toast({
        title: "Review added successfully",
        variant: "default",
      });

      setIsReviewModalOpen(false);
    } catch (error) {
      toast({
        title: "Error adding review",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Instead of handling file uploads, we'll just use the existing image URLs
    const updatedImages = service.images || [];

    // Continue with your existing submit logic using updatedImages
    // ...
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const distance = formatDistanceToNow(date, { addSuffix: true });

      // If less than 7 days, show relative time (e.g., "2 days ago")
      if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return distance;
      }

      // Otherwise show formatted date (e.g., "10 Feb 2025")
      return format(date, "d MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="relative">
      {/* Close button outside the modal */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {service.name}
                </DialogTitle>
                {service.provider && (
                  <Link
                    href={`/service-provider/${service.provider.id}`}
                    className="text-sm text-muted-foreground hover:text-primary mt-1 inline-block"
                  >
                    by {service.provider.name}
                  </Link>
                )}
              </div>

              {/* Only show edit/delete buttons for admin */}
              {isAdminView && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteAlert(true)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Main Image */}
            <div className="h-64 w-full overflow-hidden rounded-lg">
              <img
                src={selectedImage}
                alt={
                  service.images?.find((img) => img.url === selectedImage)
                    ?.alt || service.name
                }
                className="h-full w-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {service.images && service.images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {service.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    className={`h-16 w-16 object-cover cursor-pointer rounded ${
                      selectedImage === image.url
                        ? "border-2 border-blue-500"
                        : ""
                    }`}
                    onClick={() => setSelectedImage(image.url)}
                  />
                ))}
              </div>
            )}

            {/* Price and Rating Section - Updated to handle optional fields */}
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{formatPrice()}</div>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(service.rating || 0)}</div>
                <span className="text-sm text-blue-600">
                  ({service.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Service Time and Provider - Updated to handle optional fields */}
            <div className="space-y-2">
              {service.serviceTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{formatServiceTime()}</span>
                </div>
              )}
              {service.provider && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <span>Service Provider: </span>
                  <Link
                    href={`/service-provider/${service.provider.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {service.provider.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>

            {/* Features - Updated to handle optional features */}
            {service.features && service.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Features</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQs - Already handles optional FAQs */}
            {service.faqs && service.faqs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {service.faqs.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <HelpCircle className="w-5 h-5 flex-shrink-0 text-blue-600" />
                        <p className="font-medium">{faq.question}</p>
                      </div>
                      <p className="text-gray-600 ml-7">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Action Buttons */}
            <div className="space-y-4 my-6">
              <div className="flex items-center justify-start gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    /* Add buy now logic with quantity */
                  }}
                >
                  Buy Now ({quantity})
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    /* Add to cart logic with quantity */
                  }}
                >
                  Add to Cart ({quantity})
                </Button>
              </div>
            </div>

            {/* Add Review Button */}
            <div className="mb-6">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleReviewClick}
              >
                {user ? "Write a Review" : "Sign in to Review"}
              </Button>
            </div>

            {/* Reviews Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Reviews ({localService.reviews?.length || 0})
              </h3>
              {localService.reviews && localService.reviews.length > 0 ? (
                <div className="space-y-4">
                  {localService.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">
                          {review.userName || "Anonymous"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.date)}
                        </span>
                      </div>
                      <div className="flex mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      {review.reply && (
                        <div className="mt-3 ml-6 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium mb-1">
                            Provider Response
                          </p>
                          <p className="text-sm text-gray-600">
                            {review.reply.comment}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(review.reply.date)}
                          </p>
                        </div>
                      )}
                      {review.helpful > 0 && (
                        <div className="mt-2 text-sm text-gray-500">
                          {review.helpful} people found this helpful
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet</p>
              )}
            </div>

            {service.provider && (
              <div className="my-6">
                <h3 className="text-lg font-semibold mb-4">Service Provider</h3>
                <ServiceProviderCard provider={service.provider} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <AddReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        serviceId={service.id}
        onReviewAdded={handleReviewAdded}
        userName={user?.displayName || ""}
        userEmail={user?.email || ""}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              service and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-1">
            <EditServiceForm
              service={localService}
              onClose={() => setIsEditing(false)}
              onServiceUpdated={(updatedService) => {
                setLocalService(updatedService);
                onServiceUpdated?.(updatedService);
                setIsEditing(false);
                toast({
                  title: "Service updated successfully",
                  variant: "default",
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceModal;
