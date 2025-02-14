"use client";
import React from "react";
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
    <div className="sticky top-4 rounded-lg p-4 my-5 border md:w-[350px] dark:bg-[#111] dark:border-white/10">
      {/* Search Input */}
      <div className="border-b pb-4 dark:border-white/10">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">
          Search Services
        </h2>
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 
            group-hover:text-gray-600 transition-colors dark:text-white/70"
          />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full dark:bg-[#1a1a1a] dark:text-white dark:border-white/10
              dark:placeholder:text-white/50"
          />
        </div>
      </div>

      {/* Sort Options Dropdown */}
      <div className="border-b py-4 dark:border-white/10">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">Sort By</h2>
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger className="w-full dark:bg-[#1a1a1a] dark:text-white dark:border-white/10">
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent className="dark:bg-[#1a1a1a] dark:border-white/10">
            {sortOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="dark:text-white dark:hover:bg-[#222]"
              >
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
        <div className="py-4 border-b space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {selectedService && (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                bg-blue-50 text-blue-700 border border-blue-200 transition-all hover:bg-blue-100"
              >
                {serviceOptions.find((s) => s.id === selectedService)?.label}
                <button
                  onClick={onClearServiceFilter}
                  className="ml-2 hover:text-blue-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedPriceRanges.map((rangeId) => (
              <span
                key={rangeId}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                  bg-green-50 text-green-700 border border-green-200 transition-all hover:bg-green-100"
              >
                {priceRanges.find((r) => r.id === rangeId)?.label}
                <button
                  onClick={() => onClearPriceRange(rangeId)}
                  className="ml-2 hover:text-green-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {minReviewRating && (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                bg-yellow-50 text-yellow-700 border border-yellow-200 transition-all hover:bg-yellow-100"
              >
                {minReviewRating}+ Stars
                <button
                  onClick={onClearReviewFilter}
                  className="ml-2 hover:text-yellow-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Price Ranges */}
      <div className="py-4 border-b dark:border-white/10">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">
          Price Range
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => handlePriceRangeClick(range.id)}
              className={`
                p-2.5 rounded-lg text-sm font-medium
                ${
                  selectedPriceRanges.includes(range.id)
                    ? "dark:bg-white dark:text-black"
                    : "dark:bg-[#1a1a1a] dark:text-white dark:border-white/10"
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
      <div className="py-4 border-b dark:border-white/10">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">
          Minimum Reviews
        </h2>
        <div className="space-y-2">
          {reviewFilterOptions.map((option) => (
            <button
              key={option.rating}
              onClick={() => onReviewRatingChange(option.rating)}
              className={`
                w-full flex items-center justify-center p-2.5 rounded-lg text-sm font-medium
                ${
                  minReviewRating === option.rating
                    ? "dark:bg-white dark:text-black"
                    : "dark:bg-[#1a1a1a] dark:text-white dark:border-white/10"
                }
                transition-all duration-200
              `}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < option.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-white/30"
                    }`}
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
          variant="outline"
          className="w-full font-medium dark:bg-[#1a1a1a] dark:text-white dark:border-white/10 
                   dark:hover:bg-[#222]"
          onClick={onResetFilters}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}

export default FilterCard;
