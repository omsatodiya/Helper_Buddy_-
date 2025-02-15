"use client";
import React, { useState, useEffect , useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/preloader";
import Testimonials from "@/components/FAQ/Testimonials";
import FAQ from "@/components/FAQ/FAQ";
import ServiceFilters from "@/components/services/ServiceFilters";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Service, SimpleService } from "@/types/service";
import ServiceCard from "@/components/services/ServiceCard";
import {
  getFirestore,
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  query as firestoreQuery,
} from "firebase/firestore";
import ServiceModal from "@/components/services/serviceModal";
import LandingPage from "@/components/landing/hero";
import ScrollVelocity from "@/components/ui/scroll-velocity";


export default function Home() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingServices, setTrendingServices] = useState<Service[]>([]);
  const [newServices, setNewServices] = useState<Service[]>([]);
  const [topRatedServices, setTopRatedServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);


  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
    };

    // Handle both initial load and refresh
    window.addEventListener('load', handleStart);
    window.addEventListener('beforeunload', handleStart);

    return () => {
      window.removeEventListener('load', handleStart);
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredServices([]);
      return;
    }

    const db = getFirestore();
    const servicesRef = collection(db, "services");
    const searchLower = query.toLowerCase();
    const q = firestoreQuery(
      servicesRef,
      where("name", ">=", searchLower),
      where("name", "<=", searchLower + "\uf8ff")
    );

    const snapshot = await getDocs(q);
    setFilteredServices(
      snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...(doc.data() as Record<string, any>),
          } as Service)
      )
    );
  };

  const ServiceSection = ({
    title,
    services,
  }: {
    title: string;
    services: Service[];
  }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => {
          const simpleService: SimpleService = {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            imageUrl: typeof service.images?.[0] === "string" ? service.images[0] : service.images?.[0]?.url || "/placeholder-image.jpg",
            details: service.details || "",
            category: service.category || "uncategorized",
            rating: service.rating || 0,
            totalReviews: service.totalReviews || 0,
            createdAt: service.createdAt || new Date().toISOString(),
            updatedAt: service.updatedAt || new Date().toISOString(),
            provider: service.provider || null,
            servicePincodes: service.servicePincodes || []
          };
          return (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.name}
              description={service.description}
              price={service.price}
              imageUrl={simpleService.imageUrl}
              rating={service.rating || 0}
              totalRatings={service.totalReviews || 0}
              providerName={service.provider?.name}
              onAddToCart={() => {}}
              onBuyNow={() => {}}
              onClick={() => {
                setSelectedService(service);
                setIsServiceModalOpen(true);
              }}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {loading && <Preloader onLoadingComplete={() => setLoading(false)} />}
      <main className={`transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}>
        <Header />
        <LandingPage />
        <div className="container mx-auto px-4 py-12">
          {/* Service Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Browse by Category
            </h2>
            <ServiceFilters />
          </div>


          {/* Testimonials */}
          <Testimonials />

          {/* FAQ Section */}
          <FAQ />
        </div>
        <Footer />

        {/* Add Service Modal */}
        {selectedService && (
          <ServiceModal
            isOpen={isServiceModalOpen}
            onClose={() => {
              setIsServiceModalOpen(false);
              setSelectedService(null);
            }}
            service={selectedService}
            onServiceUpdated={(updatedService) => {
              setSelectedService(updatedService);
            }}
            onServiceDeleted={() => {
              setIsServiceModalOpen(false);
              setSelectedService(null);
            }}
          />
        )}
      </main>
    </>
  );
}
