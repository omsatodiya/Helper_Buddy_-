"use client";
import React from "react";
import Image from "next/image";
import { Star, X, Search } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";

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
    <div
      className="sticky top-4 rounded-lg p-4 my-5 border 
                  md:w-[350px] bg-white dark:bg-black 
                  border-gray-200 dark:border-gray-800 
                  shadow-sm transition-colors duration-200"
    >
      {/* Search Input */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Search Services
        </h2>
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 
                            text-gray-400 dark:text-gray-500 h-4 w-4 
                            group-hover:text-gray-600 dark:group-hover:text-gray-300 
                            transition-colors"
          />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full bg-white dark:bg-black
                       border-gray-200 dark:border-gray-800 
                       text-black dark:text-white
                       placeholder:text-gray-500 dark:placeholder:text-gray-400
                       focus:border-gray-300 dark:focus:border-gray-700
                       hover:border-gray-300 dark:hover:border-gray-700
                       transition-colors"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-b border-gray-200 dark:border-gray-800 py-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Sort By
        </h2>
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger
            className="w-full bg-white dark:bg-black 
                                  border-gray-200 dark:border-gray-800
                                  text-black dark:text-white
                                  hover:border-gray-300 dark:hover:border-gray-700"
          >
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            {sortOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="text-black dark:text-white
                           hover:bg-gray-50 dark:hover:bg-gray-900"
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
        <div className="py-4 border-b border-gray-200 dark:border-gray-800 space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Active Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedService && (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                             bg-white dark:bg-gray-900 
                             text-black dark:text-white 
                             border border-gray-200 dark:border-gray-800"
              >
                {serviceOptions.find((s) => s.id === selectedService)?.label}
                <button
                  onClick={onClearServiceFilter}
                  className="ml-2 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedPriceRanges.map((rangeId) => (
              <span
                key={rangeId}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                  bg-white dark:bg-gray-900 
                  text-black dark:text-white 
                  border border-gray-200 dark:border-gray-800"
              >
                {priceRanges.find((r) => r.id === rangeId)?.label}
                <button
                  onClick={() => onClearPriceRange(rangeId)}
                  className="ml-2 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {minReviewRating && (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm 
                bg-white dark:bg-gray-900 
                text-black dark:text-white 
                border border-gray-200 dark:border-gray-800"
              >
                {minReviewRating}+ Stars
                <button
                  onClick={onClearReviewFilter}
                  className="ml-2 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Price Ranges */}
      <div className="py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Price Range
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => handlePriceRangeClick(range.id)}
              className={`
                p-2.5 rounded-lg border text-sm font-medium
                ${
                  selectedPriceRanges.includes(range.id)
                    ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-800 dark:border-white"
                    : "bg-white dark:bg-black text-black dark:text-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
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
      <div className="py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Minimum Reviews
        </h2>
        <div className="space-y-2">
          {reviewFilterOptions.map((option) => (
            <button
              key={option.rating}
              onClick={() => onReviewRatingChange(option.rating)}
              className={`
                w-full flex items-center justify-center 
                p-2.5 rounded-lg border text-sm font-medium
                ${
                  minReviewRating === option.rating
                    ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-800 dark:border-white"
                    : "bg-white dark:bg-black text-black dark:text-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
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
                        : "text-gray-300 dark:text-gray-600"
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
          className="w-full font-medium bg-white dark:bg-black 
                     text-black dark:text-white
                     border-gray-200 dark:border-gray-800
                     hover:bg-gray-100 dark:hover:bg-gray-900
                     transition-colors"
          onClick={onResetFilters}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}

export default FilterCard;
