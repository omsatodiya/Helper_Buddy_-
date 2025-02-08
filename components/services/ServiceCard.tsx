import React from "react";
import { Star } from "lucide-react";
import { Button } from "../ui/button";

interface ServiceCardProps {
  title: string;
  price: number;
  rating: number;
  totalRatings: number;
  description: string;
  imageUrl: string;
  colors?: string[];
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

const ServiceCard = ({
  title,
  price,
  rating,
  totalRatings,
  description,
  imageUrl,
  colors = ["black", "white", "gray"],
  onAddToCart,
  onBuyNow,
}: ServiceCardProps) => {
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

  return (
    <div className="flex flex-col h-full max-w-sm rounded-lg bg-white p-4 shadow-sm">
      {/* Content wrapper */}
      <div className="flex-grow">
        {/* Image */}
        <div className="mb-4 h-48 w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={imageUrl || "/api/placeholder/400/300"}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Price */}
        <div className="mb-2 text-2xl font-bold text-gray-900">
          ₹{price.toFixed(2)}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>

        {/* Rating */}
        <div className="mb-2 flex items-center">
          <div className="flex mr-2">{renderStars(rating)}</div>
          <span className="text-sm text-blue-600">
            {totalRatings.toLocaleString()} ratings
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-500">{description}</p>
      </div>

      {/* Buttons - Now in a separate div with margin-top auto */}
      <div className="flex flex-col gap-2 mt-4">
        <Button variant={"outline"} onClick={onAddToCart}>
          Add to Cart
        </Button>
        <Button onClick={onBuyNow}>Buy Now</Button>
      </div>
    </div>
  );
};

export default ServiceCard;
