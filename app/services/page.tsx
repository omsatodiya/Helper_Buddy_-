"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import FilterCard from "@/components/services/FilterCard";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceModal from "@/components/services/serviceModal";
import { Filter, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Preloader from "@/components/ui/preloader";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import AddServiceForm from "@/components/services/AddServiceForm";
import { Button } from "@/components/ui/button";
import { Service, SimpleService } from "@/types/service";
import { useLoadingStore } from "@/store/loading-store";

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

const priceRanges = [
  { id: "under-100", label: "Under ₹100", min: 0, max: 100 },
  { id: "100-500", label: "₹100 - ₹500", min: 100, max: 500 },
  { id: "500-1000", label: "₹500 - ₹1000", min: 500, max: 1000 },
  { id: "1000-2000", label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { id: "2000-5000", label: "₹2000 - ₹5000", min: 2000, max: 5000 },
  { id: "above-5000", label: "Above ₹5000", min: 5000, max: null },
];

// Create a separate component for the content that uses useSearchParams
function ServicesContent() {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category");

  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<SimpleService[]>([]);
  const [filteredServices, setFilteredServices] = useState<SimpleService[]>([]);
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

  async function fetchServices() {
    try {
      setIsLoading(true);
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
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          details: service.details ?? "",
          rating: service.rating ?? 0,
          totalReviews: service.reviews?.length ?? 0,
          category: service.category ?? "",
          imageUrl: service.images?.[0]?.url || "/placeholder-image.jpg",
          createdAt: service.createdAt || new Date().toISOString(),
          updatedAt: service.updatedAt || new Date().toISOString(),
        })
      );

      setServices(transformedServices);
      setFilteredServices(transformedServices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleAddToCart = (serviceId: string) => {
    console.log(`Added service ${serviceId} to cart`);
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

  const handleReviewAdded = (updatedService: Service) => {
    // Update services list
    setServices((prevServices) =>
      prevServices.map((s) =>
        s.id === updatedService.id
          ? {
              ...s,
              rating: updatedService.rating ?? 0,
              totalReviews: updatedService.reviews?.length ?? 0,
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
              rating: updatedService.rating ?? 0,
              totalReviews: updatedService.reviews?.length ?? 0,
            }
          : s
      )
    );

    // Update selected service
    setSelectedService(updatedService);
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

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <Preloader onLoadingComplete={handleLoadingComplete} />;
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
      {/* Mobile Filter Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-full shadow-lg"
        >
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-[80%] bg-white overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="w-6 h-6" />
              </button>
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
                  setIsFilterOpen(false);
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
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isModalOpen && selectedService && (
        <ServiceModal
          service={selectedService}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onServiceDeleted={handleServiceDeleted}
          onReviewAdded={handleReviewAdded}
          onServiceUpdated={handleServiceUpdated}
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
              className="bg-white dark:bg-black text-black dark:text-white border-black/10 dark:border-white/10"
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
          <div className="flex-[3] my-5 py-4 px-4 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black w-full">
            {/* Active Filters Summary - Mobile Only */}
            <div className="md:hidden mb-4">
              {(selectedService ||
                selectedPriceRanges.length > 0 ||
                minReviewRating) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                </div>
              )}
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-gray-600 text-center py-8">
                No services match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    className="bg-white dark:bg-black text-black dark:text-white"
                    title={service.name}
                    price={service.price}
                    rating={service.rating}
                    totalRatings={service.totalReviews}
                    description={service.description}
                    imageUrl={service.imageUrl || "/api/placeholder/400/300"}
                    onAddToCart={() => handleAddToCart(service.id)}
                    onBuyNow={() => handleBuyNow(service.id)}
                    onClick={() => handleServiceClick(service)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);

  useEffect(() => {
    setMounted(true);
    setIsLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
      setIsLoading(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [setIsLoading]);

  // Don't render anything until mounted
  if (!mounted) {
    return <Preloader onLoadingComplete={() => {}} />;
  }

  return (
    <>
      {loading ? (
        <Preloader 
          onLoadingComplete={() => {
            setLoading(false);
            setIsLoading(false);
          }} 
        />
      ) : (
        <main>
          <ServicesContent />
        </main>
      )}
    </>
  );
}
