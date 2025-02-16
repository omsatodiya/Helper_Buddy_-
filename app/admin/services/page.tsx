"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AdminServiceCard from "@/components/admin/AdminServiceCard";
import ServiceModal from "@/components/services/serviceModal";
import {
  getFirestore,
  getDocs,
  collection,
  getDoc,
  doc,
} from "firebase/firestore";
import { Service, SimpleService } from "@/types/service";
import { X } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function ServicesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<SimpleService[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
            imageUrl:
              data.imageUrl ||
              data.images?.[0]?.url ||
              "/placeholder-service.jpg",
            details: data.details || "",
            category: data.category || "uncategorized",
            rating: data.rating || 0,
            totalReviews: (data.reviews || []).length,
            createdAt:
              data.createdAt instanceof Date
                ? data.createdAt.toISOString()
                : data.createdAt,
            updatedAt:
              data.updatedAt instanceof Date
                ? data.updatedAt.toISOString()
                : data.updatedAt,
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

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  // Use filtered services for pagination
  const paginatedServices = getPaginatedData(filteredServices, currentPage);

  const handleServiceClick = async (service: SimpleService) => {
    try {
      const db = getFirestore();
      const serviceDoc = await getDoc(doc(db, "services", service.id));

      if (serviceDoc.exists()) {
        const serviceData = serviceDoc.data();
        const fullService: Service = {
          id: service.id,
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          details: serviceData.details || "",
          category: serviceData.category || "uncategorized",
          rating: serviceData.rating || 0,
          reviews: serviceData.reviews || [],
          images: serviceData.images || [
            {
              url: service.imageUrl || "/placeholder-service.jpg",
              alt: service.name,
              isPrimary: true,
            },
          ],
          provider: serviceData.provider || null,
          features: serviceData.features || [],
          faqs: serviceData.faqs || [],
          createdAt: serviceData.createdAt,
          updatedAt: serviceData.updatedAt,
          serviceTime: serviceData.serviceTime || null,
        };

        setSelectedService(fullService);
        setIsServiceModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
    }
  };

  const handleServiceEdit = (service: SimpleService) => {
    handleServiceClick(service); // This will open the edit modal
  };

  const handleServiceDelete = async () => {
    // Refresh the services list after deletion
    try {
      const db = getFirestore();
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const servicesData = servicesSnapshot.docs.map((doc) => {
        const data = doc.data() as Service;
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl:
            data.imageUrl ||
            data.images?.[0]?.url ||
            "/placeholder-service.jpg",
          details: data.details || "",
          category: data.category || "uncategorized",
          rating: data.rating || 0,
          totalReviews: (data.reviews || []).length,
          createdAt:
            data.createdAt instanceof Date
              ? data.createdAt.toISOString()
              : data.createdAt,
          updatedAt:
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt,
        } as SimpleService;
      });
      setServices(servicesData);
    } catch (error) {
      console.error("Error refreshing services:", error);
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-black text-gray-900 dark:text-white 
                       focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={() => router.push("/services/add")}
            className="w-full sm:w-auto bg-black hover:bg-black/90 text-white 
                     dark:bg-white dark:hover:bg-white/90 dark:text-black"
          >
            Add New Service
          </Button>
        </div>
      </div>

      {/* Show "No results found" message when search yields no results */}
      {filteredServices.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No services found matching "{searchQuery}"
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {paginatedServices.map((service) => (
          <AdminServiceCard
          
            key={service.id}
            id={service.id}
            title={service.name}
            price={service.price}
            description={service.description}
            imageUrl={service.imageUrl}
            onEdit={() => handleServiceEdit(service)}
            onDelete={handleServiceDelete}
          />
        ))}
      </div>

      {/* Update pagination to use filtered services length */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(
          1,
          Math.ceil(filteredServices.length / ITEMS_PER_PAGE)
        )}
        onPageChange={setCurrentPage}
      />

      {selectedService && (
        <ServiceModal
          onReviewAdded={() => {}}
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          isAdminView={true}
          onServiceDeleted={handleServiceDelete}
          onServiceUpdated={async (updatedService) => {
            // Refresh services list after update
            handleServiceDelete(); // Reuse the refresh function
          }}
        />
      )}
    </div>
  );
}
