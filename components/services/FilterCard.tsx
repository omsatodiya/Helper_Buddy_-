"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Star, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import gsap from "gsap";

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
  className?: string;
  selectedService: string | null;
  selectedPriceRanges: string[];
  minReviewRating: number | null;
  sortOption: string;
  searchQuery: string;
  onServiceSelect: (serviceId: string) => void;
  onPriceRangeChange: (priceRanges: string[]) => void;
  onReviewRatingChange: (rating: number) => void;
  onSortChange: (option: string) => void;
  onClearServiceFilter: () => void;
  onClearPriceRange: (rangeId: string) => void;
  onClearReviewFilter: () => void;
  onResetFilters: () => void;
  onSearchChange: (query: string) => void;
}

function FilterCard({
  className,
  selectedService,
  selectedPriceRanges,
  minReviewRating,
  sortOption,
  searchQuery,
  onServiceSelect,
  onPriceRangeChange,
  onReviewRatingChange,
  onSortChange,
  onClearServiceFilter,
  onClearPriceRange,
  onClearReviewFilter,
  onResetFilters,
  onSearchChange,
}: FilterCardProps) {
  const filterRef = useRef<HTMLDivElement>(null);
  const activeFiltersRef = useRef<HTMLDivElement>(null);

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

  // Animation for filter card mount
  useEffect(() => {
    if (filterRef.current) {
      gsap.fromTo(
        filterRef.current,
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power3.out",
        }
      );
    }
  }, []);

  // Animation for active filters
  useEffect(() => {
    if (activeFiltersRef.current) {
      gsap.fromTo(
        activeFiltersRef.current.children,
        {
          opacity: 0,
          scale: 0.8,
          y: 10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [selectedService, selectedPriceRanges, minReviewRating]);

  return (
    <div
      ref={filterRef}
      className="sticky top-4 rounded-lg p-4 my-5 border border-gray-300 dark:border-white/20 md:w-[350px] bg-white dark:bg-black shadow-sm"
    >
      {/* Search Input */}
      <div className="border-b border-gray-200 dark:border-white/20 pb-4">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-3">
          Search Services
        </h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white/50 h-4 w-4 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full border-gray-200 dark:border-white/20 focus:border-black dark:focus:border-white transition-all hover:border-gray-300 dark:hover:border-white/40 dark:bg-black dark:text-white"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-b border-gray-200 dark:border-white/20 py-4">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-3">
          Sort By
        </h2>
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger className="w-full border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-colors dark:bg-black dark:text-white">
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent className="dark:bg-black dark:border-white/20">
            {sortOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="hover:bg-gray-50 dark:hover:bg-white/10 transition-colors dark:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters with animation */}
      {(selectedService ||
        selectedPriceRanges.length > 0 ||
        minReviewRating) && (
        <div className="py-4 border-b space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-white">
            Active Filters
          </h3>
          <div ref={activeFiltersRef} className="flex flex-wrap gap-2">
            {selectedService && (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                bg-blue-50 text-blue-700 border border-blue-200 transition-all hover:bg-blue-100
                dark:bg-black dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                {serviceOptions.find((s) => s.id === selectedService)?.label}
                <button
                  onClick={onClearServiceFilter}
                  className="ml-2 hover:text-blue-800 dark:hover:text-white/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedPriceRanges.map((rangeId) => (
              <span
                key={rangeId}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                  bg-green-50 text-green-700 border border-green-200 transition-all hover:bg-green-100
                  dark:bg-black dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                {priceRanges.find((r) => r.id === rangeId)?.label}
                <button
                  onClick={() => onClearPriceRange(rangeId)}
                  className="ml-2 hover:text-green-800 dark:hover:text-white/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {minReviewRating && (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                bg-yellow-50 text-yellow-700 border border-yellow-200 transition-all hover:bg-yellow-100
                dark:bg-black dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                {minReviewRating}+ Stars
                <button
                  onClick={onClearReviewFilter}
                  className="ml-2 hover:text-yellow-800 dark:hover:text-white/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Price Ranges */}
      <div className="py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">
          Price Range
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => handlePriceRangeClick(range.id)}
              className={`
                p-2.5 rounded-lg border text-sm font-medium transition-all duration-200
                ${
                  selectedPriceRanges.includes(range.id)
                    ? "bg-green-50 border-green-500 text-green-700 dark:bg-black dark:border-white dark:text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:bg-black dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review Filter */}
      <div className="py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">
          Minimum Reviews
        </h2>
        <div className="space-y-2">
          {reviewFilterOptions.map((option) => (
            <button
              key={option.rating}
              onClick={() => onReviewRatingChange(option.rating)}
              className={`
                w-full flex items-center justify-center 
                p-2.5 rounded-lg border text-sm font-medium transition-all duration-200
                ${
                  minReviewRating === option.rating
                    ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-black dark:border-white dark:text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:bg-black dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                }
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
                          : "text-gray-300 dark:text-gray-600"
                      }
                    `}
                  />
                ))}
                <span className="ml-2">& above</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="pt-4">
        <Button
          variant="destructive"
          className="w-full font-medium bg-red-600 hover:bg-red-700 dark:bg-black dark:text-white dark:hover:bg-white/10 transition-colors"
          onClick={onResetFilters}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}

export default FilterCard;
