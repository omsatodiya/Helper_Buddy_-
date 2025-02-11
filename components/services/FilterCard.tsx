"use client";
import React from "react";
import Image from "next/image";
import { Star, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ServiceOption {
  id: string;
  icon: string;
  label: string;
  price: number;
  reviews: number;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

interface FilterCardProps {
  selectedService: string | null;
  selectedPriceRanges: string[];
  minReviewRating: number | null;
  sortOption: string;
  onServiceSelect: (serviceId: string) => void;
  onPriceRangeChange: (priceRanges: string[]) => void;
  onReviewRatingChange: (rating: number) => void;
  onSortChange: (option: string) => void;
  onClearServiceFilter: () => void;
  onClearPriceRange: (rangeId: string) => void;
  onClearReviewFilter: () => void;
  onResetFilters: () => void;
}

function FilterCard({
  selectedService,
  selectedPriceRanges,
  minReviewRating,
  sortOption,
  onServiceSelect,
  onPriceRangeChange,
  onReviewRatingChange,
  onSortChange,
  onClearServiceFilter,
  onClearPriceRange,
  onClearReviewFilter,
  onResetFilters,
}: FilterCardProps) {
  const serviceOptions: ServiceOption[] = [
    {
      id: "switch-socket",
      icon: "/icons/switch-socket.webp",
      label: "Switch & socket",
      price: 50,
      reviews: 128,
    },
    // ... other service options
  ];

  const priceRanges: PriceRange[] = [
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

  const handlePriceRangeClick = (rangeId: string) => {
    const newSelectedRanges = selectedPriceRanges.includes(rangeId)
      ? selectedPriceRanges.filter((id) => id !== rangeId)
      : [...selectedPriceRanges, rangeId];
    onPriceRangeChange(newSelectedRanges);
  };

  return (
    <div className="rounded-lg p-4 my-5 border md:w-[350px]">
      {/* Sort Options Dropdown - Moved to top */}
      <div className="border-b p-3">
        <h2 className="text-lg font-semibold ml-2 text-gray-500 mb-4">
          Sort By
        </h2>
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {(selectedService ||
        selectedPriceRanges.length > 0 ||
        minReviewRating) && (
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedService && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {serviceOptions.find((s) => s.id === selectedService)?.label}
                <button
                  onClick={onClearServiceFilter}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPriceRanges.map((rangeId) => (
              <span
                key={rangeId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
              >
                {priceRanges.find((r) => r.id === rangeId)?.label}
                <button
                  onClick={() => onClearPriceRange(rangeId)}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {minReviewRating && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                {minReviewRating}+ Stars
                <button
                  onClick={onClearReviewFilter}
                  className="ml-1 hover:text-yellow-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Services Selection */}
      {/* <h2 className="text-lg hidden md:block font-semibold ml-2 text-gray-500 mb-4">
        Select a service
      </h2>
      <div className="grid grid-cols-3 border-b pb-4 gap-4">
        {serviceOptions.map((service) => (
          <div key={service.id}>
            <button
              onClick={() => onServiceSelect(service.id)}
              className={`
                flex flex-col items-center justify-center 
                p-3 rounded-lg w-full
                ${
                  selectedService === service.id
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gray-50 hover:bg-gray-100"
                }
                transition-all duration-200
              `}
            >
              <div className="relative w-16 h-16 mb-2">
                <Image
                  src={service.icon}
                  alt={service.label}
                  fill
                  className="object-contain"
                />
              </div>
            </button>
            <span className="text-xs text-center text-gray-700 block mt-1">
              {service.label}
            </span>
          </div>
        ))}
      </div> */}

      {/* Price Ranges */}
      <div className="border-b p-3">
        <h2 className="text-lg hidden md:block font-semibold ml-2 text-gray-500 mb-4">
          Price Range
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => handlePriceRangeClick(range.id)}
              className={`
                p-2 rounded-lg border text-sm
                ${
                  selectedPriceRanges.includes(range.id)
                    ? "bg-green-50 border-green-500 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }
                transition-all duration-200
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review Filter */}
      <div className="border-b p-3">
        <h2 className="text-lg hidden md:block font-semibold ml-2 text-gray-500 mb-4">
          Minimum Reviews
        </h2>
        <div className="grid ml-2 grid-cols-1 gap-3">
          {reviewFilterOptions.map((option) => (
            <button
              key={option.rating}
              onClick={() => onReviewRatingChange(option.rating)}
              className={`
                flex items-center justify-center 
                p-2 rounded-lg border 
                ${
                  minReviewRating === option.rating
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }
                transition-all duration-200
              `}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`
                      w-4 h-4 
                      ${
                        index < option.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    `}
                  />
                ))}
                <span className="ml-2 text-xs">& above</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="flex w-full items-center justify-center">
        <Button variant="destructive" className="mt-3" onClick={onResetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}

export default FilterCard;
