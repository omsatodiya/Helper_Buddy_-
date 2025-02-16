"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import FilterCard from "@/components/services/FilterCard";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceModal from "@/components/services/serviceModal";
import { Filter, X, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import AddServiceForm from "@/components/services/AddServiceForm";
import { Button } from "@/components/ui/button";
import { Service, SimpleService, ServiceReview } from "@/types/service";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import FloatingCart from "@/components/services/FloatingCart";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import gsap from "gsap";
import React from "react";

type ServiceCategory =
  | "electrician"
  | "plumber"
  | "carpenter"
  | "bathroom_kitchen_cleaning"
  | "sofa_carpet_cleaning"
  | "ac_repair"
  | "chimney_repair"
  | "water_purifier_repair"
  | "microwave_repair"
  | "refrigerator_repair";

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalServices: number;
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

const priceRanges = [
  { id: "under-100", label: "Under ₹100", min: 0, max: 100 },
  { id: "100-500", label: "₹100 - ₹500", min: 100, max: 500 },
  { id: "500-1000", label: "₹500 - ₹1000", min: 500, max: 1000 },
  { id: "1000-2000", label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { id: "2000-5000", label: "₹2000 - ₹5000", min: 2000, max: 5000 },
  { id: "above-5000", label: "Above ₹5000", min: 5000, max: null },
];

const reviewFilterOptions = [
  { rating: 4, label: "4 Star and above" },
  { rating: 3, label: "3 Star and above" },
  { rating: 2, label: "2 Star and above" },
];

const sortOptions = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "trending", label: "Trending" },
  { id: "price_low_high", label: "Price: Low to High" },
  { id: "price_high_low", label: "Price: High to Low" },
  { id: "rating_high_low", label: "Rating: High to Low" },
  { id: "most_reviewed", label: "Most Reviewed" },
];

// Create a separate component for the content that uses useSearchParams
function ServicesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [services, setServices] = useState<SimpleService[]>([]);
  const [filteredServices, setFilteredServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Filter states
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [minReviewRating, setMinReviewRating] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Add these state variables
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartVisible, setIsCartVisible] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  // Add ref for the grid
  const gridRef = React.useRef<HTMLDivElement>(null);

  // Add effect to animate grid changes
  useEffect(() => {
    if (gridRef.current) {
      gsap.to(gridRef.current.children, {
        duration: 0.5,
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        ease: "power3.out",
      });
    }
  }, [isCartVisible]);

  // Extract fetchServices function outside useEffect
  async function fetchServices() {
    try {
      setLoading(true);
      let servicesQuery;

      if (category) {
        servicesQuery = query(
          collection(db, "services"),
          where("category", "==", category)
        );
      } else {
        servicesQuery = collection(db, "services");
      }

      const querySnapshot = await getDocs(servicesQuery);
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];

      const transformedServices: SimpleService[] = servicesData.map(
        (service) => ({
          provider: service.provider,
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          details: service.details ?? "",
          rating: service.rating ?? 0,
          totalReviews: service.reviews?.length ?? 0,
          category: service.category ?? "",
          imageUrl: service.images?.[0]?.url || "/placeholder-image.jpg",
          createdAt: service.createdAt.toString() || new Date().toISOString(),
          updatedAt: service.updatedAt.toString() || new Date().toISOString(),
        })
      );

      setServices(transformedServices);
      setFilteredServices(transformedServices);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Use fetchServices in useEffect
  useEffect(() => {
    fetchServices();
  }, [category]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = services;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
      );
    }

    // Apply existing filters
    if (selectedService) {
      filtered = filtered.filter(
        (service) =>
          service.category?.toLowerCase() ===
          selectedService.category?.toLowerCase()
      );
    }

    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter((service) => {
        return selectedPriceRanges.some((rangeId) => {
          const range = priceRanges.find((r) => r.id === rangeId);
          if (!range) return false;
          if (range.max === null) {
            return service.price >= range.min;
          }
          return service.price >= range.min && service.price <= range.max;
        });
      });
    }

    if (minReviewRating !== null) {
      filtered = filtered.filter(
        (service) =>
          service.rating !== undefined && service.rating >= minReviewRating
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "trending":
          // Sort by a combination of recent reviews and rating
          const aScore =
            a.rating * a.totalReviews +
            new Date(a.updatedAt).getTime() / 1000000000;
          const bScore =
            b.rating * b.totalReviews +
            new Date(b.updatedAt).getTime() / 1000000000;
          return bScore - aScore;
        case "price_low_high":
          return a.price - b.price;
        case "price_high_low":
          return b.price - a.price;
        case "rating_high_low":
          return b.rating - a.rating;
        case "most_reviewed":
          return b.totalReviews - a.totalReviews;
        default:
          return 0;
      }
    });

    setFilteredServices(sorted);
  }, [
    selectedService,
    selectedPriceRanges,
    minReviewRating,
    services,
    sortOption,
    searchQuery,
  ]);

  // Filter handlers
  const handleClearServiceFilter = () => {
    setSelectedService(null);
  };

  const handleClearPriceRange = (rangeId: string) => {
    setSelectedPriceRanges((prev) => prev.filter((id) => id !== rangeId));
  };

  const handleClearReviewFilter = () => {
    setMinReviewRating(null);
  };

  const handleResetFilters = () => {
    setSelectedService(null);
    setSelectedPriceRanges([]);
    setMinReviewRating(null);
    setIsFilterOpen(false);
    setSortOption("newest");
    setSearchQuery("");
  };

  // Add useEffect to check cart status
  useEffect(() => {
    if (!user) return;

    const cartRef = doc(db, "carts", user.uid);
    const unsubscribe = onSnapshot(cartRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsCartVisible(data?.items?.length > 0);
      } else {
        setIsCartVisible(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddToCart = async (serviceId: string) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);
      const serviceDoc = await getDoc(doc(db, "services", serviceId));

      if (!serviceDoc.exists()) {
        throw new Error("Service not found");
      }

      const serviceData = serviceDoc.data();
      let cartItems = [];

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        cartItems = cartData.items || [];
      }
      const existingItemIndex = cartItems.findIndex(
        (item: { id: string }) => item.id === serviceId
      );

      if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity += 1;
      } else {
        cartItems.push({
          id: serviceId,
          name: serviceData.name,
          price: serviceData.price,
          quantity: 1,
          imageUrl: serviceData.imageUrl || "/placeholder-image.jpg",
          serviceProvider: serviceData.provider?.name || "",
        });
      }

      await setDoc(cartRef, { items: cartItems }, { merge: true });
      setIsCartVisible(true);

      toast({
        title: "Added to cart",
        description: "Service has been added to your cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add service to cart",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = (serviceId: string) => {
    console.log(`Buying service ${serviceId}`);
  };

  // Modal handlers
  const handleServiceClick = async (service: SimpleService) => {
    try {
      const serviceDoc = await getDoc(doc(db, "services", service.id));

      if (!serviceDoc.exists()) {
        throw new Error("Service not found");
      }

      const fullService = {
        id: serviceDoc.id,
        ...serviceDoc.data(),
      } as Service;

      setSelectedService(fullService);
      setIsModalOpen(true);

      // Update the service in filteredServices with new data
      setFilteredServices((prev) =>
        prev.map((s) =>
          s.id === service.id
            ? {
                ...s,
                rating: fullService.rating ?? 0,
                totalReviews: fullService.reviews?.length ?? 0,
              }
            : s
        )
      );
    } catch (error) {
      console.error("Error fetching service details:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  // Add this function to refresh services after adding a new one
  const handleServiceAdded = () => {
    // Refetch services
    setServices([]); // Clear services first
    fetchServices(); // Assuming fetchServices is the function that loads services
  };

  const handleServiceDeleted = () => {
    // Remove the deleted service from the lists
    const updatedServices = services.filter(
      (s) => s.id !== selectedService?.id
    );
    const updatedFilteredServices = filteredServices.filter(
      (s) => s.id !== selectedService?.id
    );

    setServices(updatedServices);
    setFilteredServices(updatedFilteredServices);
    setSelectedService(null);
    setIsModalOpen(false);
  };

  const handleReviewAdded = (review: ServiceReview) => {
    // Ensure the rating is typed correctly when creating a review
    const newReview: ServiceReview = {
      ...review,
      rating: review.rating as 1 | 2 | 3 | 4 | 5,
    };
    // Update services list with new review data
    setServices((prevServices) =>
      prevServices.map((s) =>
        s.id === review.id
          ? {
              ...s,
              rating: newReview.rating,
              totalReviews: s.totalReviews + 1,
            }
          : s
      )
    );

    // Update filtered services list
    setFilteredServices((prevFiltered) =>
      prevFiltered.map((s) =>
        s.id === review.id
          ? {
              ...s,
              rating: newReview.rating,
              totalReviews: s.totalReviews + 1,
            }
          : s
      )
    );
  };

  const handleServiceUpdated = (updatedService: Service) => {
    // Update services list
    setServices((prevServices) =>
      prevServices.map((s) =>
        s.id === updatedService.id
          ? {
              ...s,
              name: updatedService.name,
              description: updatedService.description,
              price: updatedService.price,
              details: updatedService.details ?? "",
              rating: updatedService.rating ?? 0,
              totalReviews: updatedService.reviews?.length ?? 0,
              category: updatedService.category ?? "",
              imageUrl:
                updatedService.images?.[0]?.url || "/placeholder-image.jpg",
            }
          : s
      )
    );

    // Update filtered services list
    setFilteredServices((prevFiltered) =>
      prevFiltered.map((s) =>
        s.id === updatedService.id
          ? {
              ...s,
              name: updatedService.name,
              description: updatedService.description,
              price: updatedService.price,
              details: updatedService.details ?? "",
              rating: updatedService.rating ?? 0,
              totalReviews: updatedService.reviews?.length ?? 0,
              category: updatedService.category ?? "",
              imageUrl:
                updatedService.images?.[0]?.url || "/placeholder-image.jpg",
            }
          : s
      )
    );

    // Update selected service in modal
    setSelectedService(updatedService);
  };

  // Add sort handler
  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  // Add this effect to handle search params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchTerm = searchParams.get("search");

    if (searchTerm) {
      setSearchQuery(searchTerm);

      const matchingService = services.find(
        (service) => service.name.toLowerCase() === searchTerm.toLowerCase()
      );

      if (matchingService) {
        // Convert null to undefined for orderId
        const orderId = searchParams.get("orderId") || undefined;
        const isCompleted = searchParams.get("isCompleted") === "true";
        const isReviewed = searchParams.get("isReviewed") === "true";

        handleServiceClick(matchingService);

        const serviceCard = document.querySelector(
          `[data-service-name="${matchingService.name}"]`
        );
        if (serviceCard) {
          setTimeout(() => {
            serviceCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 500);
        }

        // Now orderId will be string | undefined, not string | null
        setOrderStatus({
          isCompleted,
          orderId,
          isReviewed,
        });
      }
    }
  }, [services]);

  // Add state for order status
  const [orderStatus, setOrderStatus] = useState<
    | {
        isCompleted: boolean;
        orderId?: string;
        isReviewed?: boolean;
      }
    | undefined
  >(undefined);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto mt-24 p-4">
            {/* Title Skeleton */}
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />

            <div className="flex flex-col md:flex-row md:gap-14">
              {/* Desktop Filter Skeleton */}
              <div className="hidden md:block flex-1 max-w-xs">
                <div className="space-y-6 p-4 border border-gray-200 dark:border-white/10 rounded-lg">
                  {/* Search Skeleton */}
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

                  {/* Filter Sections */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services Grid Skeleton */}
              <div className="flex-[3] my-4 py-4 px-4 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="border border-gray-200 dark:border-white/10 rounded-lg p-4 space-y-4"
                    >
                      {/* Image Skeleton */}
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

                      {/* Title Skeleton */}
                      <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

                      {/* Description Skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>

                      {/* Price and Rating Skeleton */}
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>

                      {/* Buttons Skeleton */}
                      <div className="flex gap-2">
                        <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Mobile Search and Filters */}
      <div className="md:hidden sticky top-[96px] bg-white dark:bg-black z-40 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        {/* Search Bar */}
        <div className="relative group mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white/50 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full border-gray-200 dark:border-white/20 focus:border-black dark:focus:border-white"
          />
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* Sort Dropdown */}
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="min-w-[120px] bg-white dark:bg-black border-gray-200 dark:border-white/20">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="dark:bg-black">
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rating Dropdown */}
          <Select
            value={minReviewRating?.toString() || ""}
            onValueChange={(value) => setMinReviewRating(Number(value))}
          >
            <SelectTrigger className="min-w-[120px] bg-white dark:bg-black border-gray-200 dark:border-white/20">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent className="dark:bg-black">
              {reviewFilterOptions.map((option) => (
                <SelectItem
                  key={option.rating}
                  value={option.rating.toString()}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range Dropdown */}
          <Select
            value={selectedPriceRanges[0] || ""}
            onValueChange={(value) => setSelectedPriceRanges([value])}
          >
            <SelectTrigger className="min-w-[120px] bg-white dark:bg-black border-gray-200 dark:border-white/20">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent className="dark:bg-black">
              {priceRanges.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {(selectedPriceRanges.length > 0 ||
          minReviewRating ||
          sortOption !== "newest") && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedPriceRanges.map((rangeId) => (
              <span
                key={rangeId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs
                bg-green-50 text-green-700 dark:bg-black dark:text-white border border-green-200 dark:border-white/20"
              >
                {priceRanges.find((r) => r.id === rangeId)?.label}
                <button
                  onClick={() => handleClearPriceRange(rangeId)}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {minReviewRating && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs
                bg-yellow-50 text-yellow-700 dark:bg-black dark:text-white border border-yellow-200 dark:border-white/20"
              >
                {minReviewRating}+ Stars
                <button onClick={handleClearReviewFilter} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add FloatingCart component */}
      <div className="mt-[73px] border border-gray-300 rounded-md absolute right-20 z-50">
        <FloatingCart />
      </div>

      {/* Service Modal */}
      {isModalOpen && selectedService && (
        <ServiceModal
          service={selectedService}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onServiceDeleted={handleServiceDeleted}
          onReviewAdded={handleReviewAdded}
          onServiceUpdated={handleServiceUpdated}
          isReviewMode={!!searchParams.get("search")}
          orderStatus={orderStatus || undefined}
        />
      )}

      <Header />
      <div className="max-w-7xl mx-auto mt-24 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
            {category
              ? category.charAt(0).toUpperCase() + category.slice(1)
              : "All Services"}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:gap-14">
          {/* Desktop Filter Card */}
          <div className="hidden md:block flex-1 max-w-xs sticky top-4">
            <FilterCard
              selectedService={selectedService ? selectedService.id : null}
              selectedPriceRanges={selectedPriceRanges}
              minReviewRating={minReviewRating}
              sortOption={sortOption}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onServiceSelect={async (serviceId: string) => {
                try {
                  const response = await fetch(`/api/services/${serviceId}`);
                  if (!response.ok)
                    throw new Error("Failed to fetch service details");

                  const fullService: Service = await response.json();

                  const serviceWithDetails: Service = {
                    ...fullService,
                    serviceTime: fullService.serviceTime,
                  };

                  setSelectedService(serviceWithDetails);
                } catch (error) {
                  console.error("Error fetching service details:", error);
                }
              }}
              onPriceRangeChange={setSelectedPriceRanges}
              onReviewRatingChange={setMinReviewRating}
              onSortChange={handleSortChange}
              onClearServiceFilter={handleClearServiceFilter}
              onClearPriceRange={handleClearPriceRange}
              onClearReviewFilter={handleClearReviewFilter}
              onResetFilters={() => {
                handleResetFilters();
                setSortOption("newest");
                setSearchQuery("");
              }}
            />
          </div>

          {/* Services Grid */}
          <div
            className={`flex-[3] my-5 py-4 px-4 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black w-full transition-[margin] duration-500 ease-out ${
              isCartVisible ? "lg:mr-[300px]" : ""
            }`}
          >
            {/* Active Filters Summary - Mobile Only */}
            <div className="md:hidden mb-4">
              {(selectedService ||
                selectedPriceRanges.length > 0 ||
                minReviewRating) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 dark:text-white/70">
                    Active filters:
                  </span>
                </div>
              )}
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-gray-600 dark:text-white/70 text-center py-8">
                No services match the selected filters.
              </div>
            ) : (
              <div
                ref={gridRef}
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  isCartVisible ? "lg:grid-cols-2" : "lg:grid-cols-3"
                } gap-4 md:gap-6 transition-all duration-500`}
                style={{ willChange: "grid-template-columns" }}
              >
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    data-service-name={service.name}
                    id={service.id}
                    title={service.name}
                    price={service.price}
                    rating={service.rating}
                    totalRatings={service.totalReviews}
                    description={service.description}
                    imageUrl={service.imageUrl}
                    providerName={service.provider?.name}
                    onAddToCart={() => handleAddToCart(service.id)}
                    onBuyNow={() => handleBuyNow(service.id)}
                    onClick={() => handleServiceClick(service)}
                    className="transform transition-all duration-500"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main page component
export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-4 flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading services...</div>
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
