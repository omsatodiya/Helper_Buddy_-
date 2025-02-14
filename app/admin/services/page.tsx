"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceModal from "@/components/services/serviceModal";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { Service, SimpleService } from "@/types/service";

const ITEMS_PER_PAGE = 10;

export default function ServicesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<SimpleService[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore();
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map((doc) => {
          const data = doc.data() as Service;
          const simpleService: SimpleService = {
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            imageUrl: data.imageUrl || data.images?.[0]?.url || "/placeholder-service.jpg",
            details: data.details || "",
            category: data.category || "uncategorized",
            rating: data.rating || 0,
            totalReviews: (data.reviews || []).length,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          };
          return simpleService;
        });
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getPaginatedData = (data: SimpleService[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const paginatedServices = getPaginatedData(services, currentPage);

  const handleServiceDeleted = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const servicesData = servicesSnapshot.docs.map((doc) => {
        const data = doc.data() as Service;
        const simpleService: SimpleService = {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl || data.images?.[0]?.url || "/placeholder-service.jpg",
          details: data.details || "",
          category: data.category || "uncategorized",
          rating: data.rating || 0,
          totalReviews: (data.reviews || []).length,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        return simpleService;
      });
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
      setIsServiceModalOpen(false);
      setSelectedService(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Services Management
        </h2>
        <Button
          onClick={() => router.push("/services/add")}
          className="w-full sm:w-auto bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
        >
          Add New Service
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {paginatedServices.map((service) => (
          <ServiceCard
            key={service.id}
            id={service.id}
            title={service.name}
            description={service.description}
            price={service.price}
            rating={service.rating}
            totalRatings={service.totalReviews}
            imageUrl={service.imageUrl}
            onAddToCart={() => {}}
            onBuyNow={() => {}}
            onClick={() => {
              setSelectedService(service);
              setIsServiceModalOpen(true);
            }}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE))}
        onPageChange={setCurrentPage}
      />

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          isAdminView={true}
          onServiceDeleted={handleServiceDeleted}
          onServiceUpdated={async (updatedService) => {
            setIsLoading(true);
            try {
              const db = getFirestore();
              const servicesSnapshot = await getDocs(collection(db, "services"));
              const servicesData = servicesSnapshot.docs.map((doc) => {
                const data = doc.data() as Service;
                const simpleService: SimpleService = {
                  id: doc.id,
                  name: data.name,
                  description: data.description,
                  price: data.price,
                  imageUrl: data.imageUrl || data.images?.[0]?.url || "/placeholder-service.jpg",
                  details: data.details || "",
                  category: data.category || "uncategorized",
                  rating: data.rating || 0,
                  totalReviews: (data.reviews || []).length,
                  createdAt: data.createdAt || new Date().toISOString(),
                  updatedAt: data.updatedAt || new Date().toISOString()
                };
                return simpleService;
              });
              setServices(servicesData);
            } catch (error) {
              console.error("Error fetching services:", error);
            } finally {
              setIsLoading(false);
              setSelectedService(updatedService);
            }
          }}
        />
      )}
    </div>
  );
} 