import React from "react";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import { SimpleService } from "../../types/service";
import { cn } from "../../lib/utils";
import Script from "next/script";

interface ServiceCardProps {
  className?: string;
  title: string;
  price: number;
  rating?: number;
  totalRatings?: number;
  description: string;
  imageUrl?: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onClick?: () => void;
  service: SimpleService;
}

const ServiceCard = ({
  title,
  price,
  rating = 0,
  totalRatings,
  description,
  imageUrl,
  onAddToCart,
  onBuyNow,
  onClick,
  className,
  service,
}: ServiceCardProps) => {
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const generateStructuredData = (service: SimpleService) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'Organization',
        name: 'Helper Buddy',
        url: 'https://helperbuddy.com'
      },
      areaServed: service.servicePincodes?.map(p => p.pincode).join(', '),
      offers: {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'INR'
      }
    };
  };

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col dark:border dark:border-gray-800",
        className
      )}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl || "/placeholder-image.jpg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow dark:bg-black">
        {/* Title and Description */}
        <div className="space-y-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-1">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {description}
          </p>
        </div>

        {/* Push buttons to bottom with auto-spacing */}
        <div className="mt-auto space-y-4">
          {/* Price and Rating */}
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary dark:text-primary/90">
              {formatPrice(price)}
            </span>
            <div className="flex items-center">
              {rating > 0 ? (
                <>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({totalRatings})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No reviews yet
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-black dark:text-white border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
            >
              Add to Cart
            </Button>
            <Button
              className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow();
              }}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      <Script
        id={`service-schema-${service.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(service))
        }}
      />
    </div>
  );
};

export default ServiceCard;
