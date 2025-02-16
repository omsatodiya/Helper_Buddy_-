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
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { useRouter } from "next/navigation"

const services = [
  {
    id: 1,
    title: "AC Service and Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional AC maintenance and repair services",
    path: "/services/ac-repair"
  },
  {
    id: 2,
    title: "Washing Machine Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Expert washing machine repair and servicing",
    path: "/services/washing-machine"
  },
  {
    id: 3,
    title: "Water Purifier Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Quality water purifier maintenance and repairs",
    path: "/services/water-purifier"
  },
  {
    id: 4,
    title: "Refrigerator Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional refrigerator repair services",
    path: "/services/refrigerator"
  },
  {
    id: 5,
    title: "Microwave Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Expert microwave repair and maintenance",
    path: "/services/microwave"
  }
];

const cleaningServices = [
  {
    id: 1,
    title: "Home Deep Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional home deep cleaning services",
    path: "/services/home-cleaning"
  },
  {
    id: 2,
    title: "Pest Control",
    image: "https://picsum.photos/id/237/200/300",
    description: "Complete pest control solutions",
    path: "/services/pest-control"
  },
  {
    id: 3,
    title: "Carpet Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Expert carpet cleaning services",
    path: "/services/carpet-cleaning"
  },
  {
    id: 4,
    title: "Sofa Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional sofa cleaning services",
    path: "/services/sofa-cleaning"
  },
  {
    id: 5,
    title: "Kitchen Deep Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Thorough kitchen cleaning services",
    path: "/services/kitchen-cleaning"
  }
];

function ServicesCarousel() {
  const router = useRouter();

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AC & Appliance Repair
          </h2>
          <button 
            onClick={() => router.push('/services')}
            className="text-primary hover:underline"
          >
            See all
          </button>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {services.map((service) => (
              <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(service.path)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {service.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  )
}

function CleaningServicesCarousel() {
  const router = useRouter();

  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cleaning & Pest Control
          </h2>
          <button 
            onClick={() => router.push('/services/cleaning')}
            className="text-primary hover:underline"
          >
            See all
          </button>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {cleaningServices.map((service) => (
              <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(service.path)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {service.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  )
}

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
            createdAt: service.createdAt?.toString() || new Date().toISOString(),
            updatedAt: service.updatedAt?.toString() || new Date().toISOString(),
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
        <ServicesCarousel />
        <CleaningServicesCarousel />
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
            onReviewAdded={() => {}}
          />
        )}
      </main>
    </>
  );
}
