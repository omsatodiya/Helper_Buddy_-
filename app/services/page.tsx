"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import FilterCard from "@/components/services/FilterCard";
import ServiceCard from "@/components/services/ServiceCard";
import { Filter, X } from "lucide-react";

interface Service {
  _id: string;
  name: string;
  details: string;
  price: number;
  review: number;
  category: string;
  imageUrl?: string;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

const priceRanges: PriceRange[] = [
  { id: "under-100", label: "Under ₹100", min: 0, max: 100 },
  { id: "100-500", label: "₹100 - ₹500", min: 100, max: 500 },
  { id: "500-1000", label: "₹500 - ₹1000", min: 500, max: 1000 },
  { id: "1000-2000", label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { id: "2000-5000", label: "₹2000 - ₹5000", min: 2000, max: 5000 },
  { id: "above-5000", label: "Above ₹5000", min: 5000, max: null },
];

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  // States for services and loading
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [minReviewRating, setMinReviewRating] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch services
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const url = category
          ? `/api/services?category=${category}`
          : "/api/services";

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch services");

        const data = await res.json();
        setServices(data);
        setFilteredServices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [category]);

  // Apply filters
  useEffect(() => {
    let filtered = services;

    if (selectedService) {
      filtered = filtered.filter(
        (service) =>
          service.category.toLowerCase() === selectedService.toLowerCase()
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
        (service) => service.review >= minReviewRating
      );
    }

    setFilteredServices(filtered);
  }, [selectedService, selectedPriceRanges, minReviewRating, services]);

  // Filter clearing handlers
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
  };

  const handleAddToCart = (serviceId: string) => {
    console.log(`Added service ${serviceId} to cart`);
  };

  const handleBuyNow = (serviceId: string) => {
    console.log(`Buying service ${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading services...</div>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
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
                selectedService={selectedService}
                selectedPriceRanges={selectedPriceRanges}
                minReviewRating={minReviewRating}
                onServiceSelect={(service) => {
                  setSelectedService(service);
                  setIsFilterOpen(false);
                }}
                onPriceRangeChange={setSelectedPriceRanges}
                onReviewRatingChange={setMinReviewRating}
                onClearServiceFilter={handleClearServiceFilter}
                onClearPriceRange={handleClearPriceRange}
                onClearReviewFilter={handleClearReviewFilter}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        {/* Page Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {category
            ? category.charAt(0).toUpperCase() + category.slice(1)
            : "All Services"}
        </h1>

        <div className="flex flex-col md:flex-row md:gap-14">
          {/* Desktop Filter Card */}
          <div className="hidden md:block flex-1 max-w-xs sticky top-4">
            <FilterCard
              selectedService={selectedService}
              selectedPriceRanges={selectedPriceRanges}
              minReviewRating={minReviewRating}
              onServiceSelect={setSelectedService}
              onPriceRangeChange={setSelectedPriceRanges}
              onReviewRatingChange={setMinReviewRating}
              onClearServiceFilter={handleClearServiceFilter}
              onClearPriceRange={handleClearPriceRange}
              onClearReviewFilter={handleClearReviewFilter}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Services Grid */}
          <div className="flex-[3] my-5 py-4 px-4 rounded-lg border w-full">
            {/* Active Filters Summary - Mobile Only */}
            <div className="md:hidden mb-4">
              {(selectedService ||
                selectedPriceRanges.length > 0 ||
                minReviewRating) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {/* ... (filter tags) */}
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
                    key={service._id}
                    title={service.name}
                    price={service.price}
                    rating={service.review}
                    totalRatings={3}
                    description={service.details}
                    imageUrl={service.imageUrl || "/api/placeholder/400/300"}
                    onAddToCart={() => handleAddToCart(service._id)}
                    onBuyNow={() => handleBuyNow(service._id)}
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
