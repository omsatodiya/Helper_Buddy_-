"use client";
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wrench,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Service } from "@/types/service";
import AddReviewModal from "./AddReviewModal";
import { useToast } from "../../hooks/use-toast";
import { db } from "@/lib/firebase/firebase";
import {
  deleteDoc,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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
import EditReviewModal from "./EditReviewModal";
import { addToCart } from "@/lib/firebase/cart";

interface ServiceLocation {
  city: string;
  pincode: string;
  state: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  photo: string;
  servicePincodes: ServiceLocation[];
  services: string[];
  status: string;
  updatedAt: string;
  applicationDate: string;
  approvalDate: string;
  createdAt: string;
}

interface ServiceReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  date: string;
  editedAt?: string;
  isEdited?: boolean;
  helpful: number;
  reply?: {
    comment: string;
    date: string;
  };
  userId: string;
  createdAt: Date;
  orderId: string;
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

interface ServiceStatus {
  isCompleted: boolean;
  purchaseDate?: string;
  completionDate?: string;
}

interface ServiceModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onServiceDeleted: () => void;
  onReviewAdded: (review: import("@/types/service").ServiceReview) => void;
  onServiceUpdated: (service: Service) => void;
  isAdminView?: boolean;
  // onReviewAdded: (review: {
  //   id: string;
  //   rating: 1 | 2 | 3 | 4 | 5; // Match the ServiceReview type
  //   comment: string;
  //   userName: string;
  //   userEmail: string;
  //   date: string;
  //   editedAt?: string;
  //   isEdited?: boolean;
  //   helpful: number;
  //   reply?: {
  //     comment: string;
  //     date: string;
  //   };
  //   userId: string;
  //   createdAt: Date;
  //   orderId: string;
  // }) => void;
  isInCart?: boolean;
  quantity?: number;
  onQuantityChange?: (newQuantity: number) => void;
  serviceStatus?: {
    isCompleted: boolean;
    orderId?: string;
    isReviewed?: boolean;
  };
  isReviewMode?: boolean;
  orderStatus?: {
    isCompleted: boolean;
    orderId?: string;
    isReviewed?: boolean;
  };
}

const ServiceModal = ({
  isOpen,
  onClose,
  service,
  isAdminView = false,
  onServiceDeleted,
  onReviewAdded,
  onServiceUpdated,
  isInCart = false,
  quantity = 1,
  onQuantityChange,
  serviceStatus,
  isReviewMode = false,
  orderStatus,
}: ServiceModalProps) => {
  const [selectedImage, setSelectedImage] = useState(
    service.images?.[0]?.url || "/placeholder-image.jpg"
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { toast } = useToast();
  const [localService, setLocalService] = useState(service);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ServiceReview | null>(
    null
  );
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(1);
  const [categoryProviders, setCategoryProviders] = useState<ServiceProvider[]>(
    []
  );

  useEffect(() => {
    setLocalService(service);
  }, [service]);

  useEffect(() => {
    if (isReviewMode) {
      const reviewsSection = document.getElementById("reviews-section");
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: "smooth" });
        setIsReviewModalOpen(true);
      }
    }
  }, [isReviewMode]);

  useEffect(() => {
    if (
      user &&
      isReviewMode &&
      orderStatus?.orderId &&
      !orderStatus.isReviewed
    ) {
      setIsReviewModalOpen(true);
    }
  }, [user, isReviewMode, orderStatus]);

  // Auto-slide effect
  useEffect(() => {
    if (!service.images || service.images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === service.images!.length - 1 ? 0 : prev + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(timer);
  }, [service.images]);

  // Navigation functions
  const nextImage = useCallback(() => {
    if (!service.images) return;
    setCurrentImageIndex((prev) =>
      prev === service.images!.length - 1 ? 0 : prev + 1
    );
  }, [service.images]);

  const prevImage = useCallback(() => {
    if (!service.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? service.images!.length - 1 : prev - 1
    );
  }, [service.images]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index <= Math.floor(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : index - rating <= 0.5
                  ? "fill-yellow-400 text-yellow-400 opacity-50"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
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

  const handleDelete = useCallback(async () => {
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
  }, [service.id, onClose, onServiceDeleted]);

  const handleReviewClick = useCallback(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to write a review",
        variant: "destructive",
      });
      return;
    }

    if (orderStatus?.orderId && !orderStatus.isReviewed) {
      setIsReviewModalOpen(true);
    }
  }, [user, orderStatus, toast]);

  const handleReviewAdded = async (newReview: {
    rating: number;
    comment: string;
  }) => {
    try {
      if (!user || !orderStatus?.orderId) {
        throw new Error(
          "Must be logged in and have a valid order to add review"
        );
      }

      const reviewData = {
        ...newReview,
        userName: user.displayName || "Anonymous",
        userEmail: user.email,
        date: new Date().toISOString(),
        id: crypto.randomUUID(),
        orderId: orderStatus.orderId,
        helpful: 0,
      };

      // Update service with new review
      const serviceRef = doc(db, "services", service.id);
      await updateDoc(serviceRef, {
        reviews: arrayUnion(reviewData),
        totalReviews: (service.totalReviews || 0) + 1,
        rating: calculateNewRating(
          service.rating || 0,
          service.totalReviews || 0,
          newReview.rating
        ),
      });

      // Mark order as reviewed
      if (orderStatus.orderId) {
        const orderRef = doc(db, "serviceRequests", orderStatus.orderId);
        await updateDoc(orderRef, {
          isReviewed: true,
        });
      }

      toast({
        title: "Review Added",
        description: "Thank you for your review!",
        variant: "default",
      });

      setIsReviewModalOpen(false);
      onClose();
    } catch (error) {
      console.error("Error adding review:", error);
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateNewRating = (
    currentRating: number,
    totalReviews: number,
    newRating: number
  ) => {
    const totalRating = currentRating * totalReviews;
    return (totalRating + newRating) / (totalReviews + 1);
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

  const handleQuantityAdjustment = (change: number) => {
    const newQuantity = localQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setLocalQuantity(newQuantity);
    }
  };

  const handleEditReview = (review: ServiceReview) => {
    setSelectedReview(review);
    setIsEditModalOpen(true);
  };

  const handleReviewEdited = async (editedReview: {
    rating: number;
    comment: string;
  }) => {
    if (!selectedReview || !user) return;

    try {
      const serviceRef = doc(db, "services", service.id);

      // Remove old review
      await updateDoc(serviceRef, {
        reviews: arrayRemove(selectedReview),
      });

      // Create updated review
      const updatedReview = {
        ...selectedReview,
        rating: editedReview.rating,
        comment: editedReview.comment,
        editedAt: new Date().toISOString(),
        isEdited: true,
      };

      // Add updated review
      await updateDoc(serviceRef, {
        reviews: arrayUnion(updatedReview),
      });

      // Update local state
      const updatedService = {
        ...localService,
        reviews: localService.reviews?.map((review) =>
          review.id === selectedReview.id ? updatedReview : review
        ),
      };
      setLocalService(updatedService as Service);
      onServiceUpdated?.(updatedService as Service);

      toast({
        title: "Review updated",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error updating review",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    setIsEditModalOpen(false);
    setSelectedReview(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      const serviceRef = doc(db, "services", service.id);
      const reviewToDelete = localService.reviews?.find(
        (r) => r.id === reviewId
      );

      if (!reviewToDelete) return;

      // Remove review from Firebase
      await updateDoc(serviceRef, {
        reviews: arrayRemove(reviewToDelete),
      });

      // Update local state
      const updatedService = {
        ...localService,
        reviews: localService.reviews?.filter((r) => r.id !== reviewId),
      };

      setLocalService(updatedService);
      onServiceUpdated?.(updatedService);

      toast({
        title: "Review deleted",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error deleting review",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Add this function to calculate average rating
  // const calculateAverageRating = (
  //   reviews: ServiceReview[] | undefined
  // ): number => {
  //   if (!reviews || reviews.length === 0) return 0;

  //   const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  //   const average = sum / reviews.length;

  //   // Round to 1 decimal place
  //   return Math.round(average * 10) / 10;
  // };

  // Use it in your component
  const averageRating = useMemo(() => {
    if (!service.reviews?.length) return 0;
    return (
      service.reviews.reduce((acc, review) => acc + review.rating, 0) /
      service.reviews.length
    );
  }, [service.reviews]);

  // // Add this function to calculate rating distribution
  // const calculateRatingDistribution = (
  //   reviews: ServiceReview[] | undefined
  // ) => {
  //   const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  //   if (!reviews?.length) return distribution;

  //   reviews.forEach((review) => {
  //     const rating = Math.round(review.rating);
  //     distribution[rating as keyof typeof distribution]++;
  //   });

  //   return distribution;
  // };

  // In your ServiceModal component, add this JSX after the average rating display
  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    service.reviews?.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }, [service.reviews]);

  const totalReviews = useMemo(
    () => service.reviews?.length || 0,
    [service.reviews]
  );

  // Add this function to handle the scroll
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById("reviews-section");
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      await handleDeleteReview(reviewToDelete);
      setReviewToDelete(null);
    } catch (error) {
      toast({
        title: "Error deleting review",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
        className: "bg-white dark:bg-black border dark:border-white/10",
      });
      return;
    }

    try {
      await addToCart(user.uid, {
        id: service.id,
        name: service.name,
        price: service.price,
        quantity: localQuantity,
        imageUrl: service.images?.[0]?.url || "/placeholder-image.jpg",
        serviceProvider: service.provider?.name,
      });

      toast({
        title: "Added to cart",
        description: `${localQuantity} ${
          localQuantity === 1 ? "item" : "items"
        } added to your cart`,
        variant: "default",
      });

      setLocalQuantity(1);
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add service to cart",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchCategoryProviders = async () => {
      // Get the service name instead of category
      const serviceName = service.name;
      if (!serviceName) {
        console.log("No service name found:", service);
        return;
      }

      console.log("Fetching providers for service:", serviceName);

      try {
        // Update query to match your database structure
        const providersQuery = query(
          collection(db, "providers"),
          where("services", "array-contains", serviceName)
        );

        const snapshot = await getDocs(providersQuery);
        console.log("Providers found:", snapshot.docs.length);

        const providers = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as ServiceProvider)
        );

        console.log("Fetched providers:", providers);
        setCategoryProviders(providers);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };

    fetchCategoryProviders();
  }, [service.name]); // Change dependency to service.name

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
            {/* Main Image Slider */}
            <div
              className="relative h-64 w-full"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                {service.images && service.images.length > 0 && (
                  <img
                    src={service.images[currentImageIndex].url}
                    alt={service.images[currentImageIndex].alt || service.name}
                    className="h-full w-full object-cover transition-transform duration-500"
                  />
                )}

                {/* Navigation Arrows */}
                {service.images && service.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {service.images && service.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {service.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`h-2 w-2 rounded-full transition-all ${
                          currentImageIndex === index
                            ? "bg-white w-4"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {service.images && service.images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {service.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    className={`h-16 w-16 object-cover cursor-pointer rounded transition-all ${
                      currentImageIndex === index
                        ? "border-2 border-blue-500 opacity-100"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Price and Rating Section - Updated to handle optional fields */}
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{formatPrice()}</div>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(averageRating)}</div>
                <span className="text-sm text-blue-600">
                  {averageRating > 0 && (
                    <>
                      {averageRating}
                      <button
                        onClick={scrollToReviews}
                        className="ml-1 hover:underline cursor-pointer"
                      >
                        ({totalReviews} reviews)
                      </button>
                    </>
                  )}
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

              {service.thresholdTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Arrival Time: {service.thresholdTime} minutes</span>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                      Maximum time within which service provider will reach your
                      location
                    </div>
                  </div>
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

            {/* Add this after the price section */}
            <div className="mt-4 space-y-4">
              {user && orderStatus?.isCompleted && !orderStatus.isReviewed && (
                <Button
                  onClick={handleReviewClick}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Write Review
                </Button>
              )}
            </div>

            {/* Add this JSX where you want to show the rating distribution */}
            <div className="mb-8 border-b pb-6">
              {/* Rating Overview */}
              <div className="flex items-baseline gap-3 mb-4">
                <div className="flex items-center">
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  <span className="text-4xl font-bold ml-2">
                    {averageRating.toFixed(2)}
                  </span>
                </div>
                <span className="text-gray-600">{totalReviews} reviews</span>
              </div>

              {/* Rating Distribution Bars */}
              <div className="space-y-3 max-w-md ">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    ratingDistribution[
                      rating as keyof typeof ratingDistribution
                    ];
                  const percentage = totalReviews
                    ? (count / totalReviews) * 100
                    : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center w-12">
                        <Star className="w-4 h-4 fill-gray-400 text-gray-400" />
                        <span className="text-sm text-gray-600 ml-1">
                          {rating}
                        </span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-10">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Section */}
            <div id="reviews-section" className="space-y-6">
              <h3 className="text-xl font-semibold">
                Reviews ({totalReviews})
              </h3>

              {localService.reviews && localService.reviews.length > 0 ? (
                <div className="space-y-8">
                  {localService.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-6 last:border-0"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              {review.userName || "Anonymous"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-white text-sm ${
                                review.rating >= 4
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              }`}
                            >
                              ★ {review.rating}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {formatDate(review.date)}
                            {review.isEdited && (
                              <>
                                <span>•</span>
                                <span className="italic">(edited)</span>
                              </>
                            )}
                          </div>
                        </div>
                        {user?.email === review.userEmail && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 text-red-600 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteClick(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No reviews yet</p>
              )}
            </div>

            {/* Service Providers Section */}
            {categoryProviders.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">
                  Service Providers in Your Area
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {categoryProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-white/10"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-lg">
                            {provider.name}
                          </h4>
                          <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {provider.status}
                          </span>
                        </div>
                        <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                          {provider.servicePincodes.map((location, index) => (
                            <p key={index} className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {location.city}, {location.state} -{" "}
                              {location.pincode}
                            </p>
                          ))}
                          <p className="flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Services: {provider.services.join(", ")}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => {
                          /* Add your service request logic here */
                        }}
                      >
                        Request Service
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Add EditReviewModal */}
      {selectedReview && (
        <EditReviewModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReview(null);
          }}
          review={selectedReview}
          onReviewEdited={handleReviewEdited}
        />
      )}

      {/* Add the Alert Dialog */}
      <AlertDialog
        open={!!reviewToDelete}
        onOpenChange={() => setReviewToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Review Modal */}
      {user && (
        <AddReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewAdded}
          serviceId={service.id}
        />
      )}
    </div>
  );
};

export default memo(ServiceModal);
