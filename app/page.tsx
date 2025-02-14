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
import { Service } from "@/types/service";
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



  
  const fetchServices = async () => {
    try {
      const db = getFirestore();

      // Updated trending query to use bookings field
      const trendingQuery = query(
        collection(db, "services"),
        orderBy("bookings", "desc"),
        limit(4)
      );

      // Fetch new services
      const newServicesQuery = query(
        collection(db, "services"),
        orderBy("createdAt", "desc"),
        limit(4)
      );

      // Fetch top rated services
      const topRatedQuery = query(
        collection(db, "services"),
        orderBy("rating", "desc"),
        limit(4)
      );

      const [trendingSnap, newSnap, topRatedSnap] = await Promise.all([
        getDocs(trendingQuery),
        getDocs(newServicesQuery),
        getDocs(topRatedQuery),
      ]);

      setTrendingServices(
        trendingSnap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Service)
        )
      );
      setNewServices(
        newSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Service))
      );
      setTopRatedServices(
        topRatedSnap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Service)
        )
      );
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

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
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.name}
            description={service.description}
            price={service.price}
            imageUrl={
              typeof service.images?.[0] === "string"
                ? service.images[0]
                : service.images?.[0]?.url || "/placeholder-image.jpg"
            }
            rating={service.rating || 0}
            totalRatings={service.reviews?.length || 0}
            onAddToCart={() => {}}
            onBuyNow={() => {}}
            onClick={() => {
              setSelectedService(service);
              setIsServiceModalOpen(true);
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {loading && <Preloader onLoadingComplete={() => setLoading(false)} />}
      <main
        className={`transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Header />

        {/* Hero Section with Search */}
        {/* <div className="relative h-[500px] bg-gradient-to-r from-primary to-primary/80">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
              Your One-Stop Solution for Home Services
            </h1>
            <p className="text-xl md:text-2xl text-center mb-8">
              Professional, Reliable, and Affordable Services at Your Doorstep
            </p>
            <div className="w-full max-w-2xl relative">
              <Input
                type="text"
                placeholder="Search for services..."
                className="w-full h-12 pl-12 pr-4 rounded-full text-gray-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {filteredServices.length > 0 && (
              <div className="absolute top-full mt-2 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    {service.name}
                  </div>
                ))}
              </div>
            )}
          </div> */}
        {/* </div> */}
        {/* <LandingPage /> */}
        <div className="container mx-auto px-4 py-12">
          {/* Service Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Browse by Category
            </h2>
            <ServiceFilters />
          </div>

          {/* Trending Services */}
          <ServiceSection
            title="Trending Services"
            services={trendingServices}
          />

          {/* New Arrivals */}
          <ServiceSection title="New Services" services={newServices} />

          {/* Top Rated Services */}
          <ServiceSection
            title="Top Rated Services"
            services={topRatedServices}
          />

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
              fetchServices(); // Refresh services after update
              setSelectedService(updatedService);
            }}
            onServiceDeleted={() => {
              fetchServices(); // Refresh services after deletion
              setIsServiceModalOpen(false);
              setSelectedService(null);
            }}
          />
        )}
      </main>
    </>
  );
}
