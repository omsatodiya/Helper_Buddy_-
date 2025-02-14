import React from "react";
import { Card, CardContent } from "../ui/card";
import { Star, Phone, Mail } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalServices: number;
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  showContactInfo?: boolean;
}

const ServiceProviderCard = ({
  provider,
  showContactInfo = false,
}: ServiceProviderCardProps) => {
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
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{provider.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">{renderStars(provider.rating)}</div>
                <span className="text-sm text-gray-500">
                  ({provider.totalServices} reviews)
                </span>
              </div>
            </div>
          </div>

          {showContactInfo && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{provider.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{provider.email}</span>
              </div>
            </div>
          )}

          <Link href={`/service-provider/${provider.id}`}>
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceProviderCard;
