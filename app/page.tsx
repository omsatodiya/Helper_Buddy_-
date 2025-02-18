"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GridMotion from "@/components/landing/GridMotion";

const items = [
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707290/blogs/wjzg3llntnuaugdqsu5c.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707384/blogs/wrzhpejhtovejqctb4ed.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739825538/blogs/hboee5gskpguzy9oyqvu.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707136/blogs/pkywrbv5n1nmbisrfhdk.webp",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707489/blogs/tdv7sth80nie8mmcegox.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739742616/blogs/itt1hjptb75wtdkdberm.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739706490/blogs/g0faa5w3nrkazzzsu569.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707225/blogs/ycijlchxucsfrgkss1o7.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739825538/blogs/hboee5gskpguzy9oyqvu.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707136/blogs/pkywrbv5n1nmbisrfhdk.webp",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707489/blogs/tdv7sth80nie8mmcegox.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739742616/blogs/itt1hjptb75wtdkdberm.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707739/blogs/omi4p0f5ymcneegwyebi.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739706688/blogs/xvhugdmaklkbt1yeocwc.webp",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707290/blogs/wjzg3llntnuaugdqsu5c.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707384/blogs/wrzhpejhtovejqctb4ed.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739825538/blogs/hboee5gskpguzy9oyqvu.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707384/blogs/wrzhpejhtovejqctb4ed.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739825538/blogs/hboee5gskpguzy9oyqvu.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707136/blogs/pkywrbv5n1nmbisrfhdk.webp",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707489/blogs/tdv7sth80nie8mmcegox.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739742616/blogs/itt1hjptb75wtdkdberm.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739742616/blogs/itt1hjptb75wtdkdberm.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739706490/blogs/g0faa5w3nrkazzzsu569.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707225/blogs/ycijlchxucsfrgkss1o7.avif",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739825538/blogs/hboee5gskpguzy9oyqvu.jpg",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707136/blogs/pkywrbv5n1nmbisrfhdk.webp",
    "https://res.cloudinary.com/dylgppwvp/image/upload/v1739707489/blogs/tdv7sth80nie8mmcegox.avif",
];


const services = [
  {
    id: 1,
    title: "AC Service and Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional AC maintenance and repair services",
    path: "/services/ac-repair",
  },
  {
    id: 2,
    title: "Washing Machine Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Expert washing machine repair and servicing",
    path: "/services/washing-machine",
  },
  {
    id: 3,
    title: "Water Purifier Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Quality water purifier maintenance and repairs",
    path: "/services/water-purifier",
  },
  {
    id: 4,
    title: "Refrigerator Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional refrigerator repair services",
    path: "/services/refrigerator",
  },
  {
    id: 5,
    title: "Microwave Repair",
    image: "https://picsum.photos/id/237/200/300",
    description: "Expert microwave repair and maintenance",
    path: "/services/microwave",
  },
];

const cleaningServices = [
  {
    id: 1,
    title: "Home Deep Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional home deep cleaning services",
    path: "/services/home-cleaning",
  },
  {
    id: 2,
    title: "Pest Control",
    image: "https://picsum.photos/id/237/200/300",
    description: "Complete pest control solutions",
    path: "/services/pest-control",
  },
  {
    id: 3,
    title: "Carpet Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Expert carpet cleaning services",
    path: "/services/carpet-cleaning",
  },
  {
    id: 4,
    title: "Sofa Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Professional sofa cleaning services",
    path: "/services/sofa-cleaning",
  },
  {
    id: 5,
    title: "Kitchen Deep Cleaning",
    image: "https://picsum.photos/id/237/200/300",
    description: "Thorough kitchen cleaning services",
    path: "/services/kitchen-cleaning",
  },
];

// Create a type for category configuration
interface CategoryConfig {
  title: string;
  categories: string[];
  path: string;
}

// Define the categories configuration
const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    title: "Cleaning Services",
    categories: ["Bathroom Kitchen Cleaning", "Cleaning"],
    path: "/services/cleaning"
  },
  {
    title: "Home Services",
    categories: ["Electrician", "Plumber"],
    path: "/services"
  }
];

// Create a reusable carousel component
function ServicesCategoryCarousel({ config }: { config: CategoryConfig }) {
  const router = useRouter();
  const [servicesData, setServicesData] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const db = getFirestore();
        const servicesRef = collection(db, "services");
        const q = query(
          servicesRef,
          where("category", "in", config.categories),
          limit(5)
        );
        
        const snapshot = await getDocs(q);
        const services = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        
        setServicesData(services);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [config.categories]);

  const handleServiceClick = (serviceName: string) => {
    router.push(`/services?search=${encodeURIComponent(serviceName)}`);
  };

  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {config.title}
          </h2>
          <button
            onClick={() => router.push(config.path)}
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
            {servicesData.map((service) => (
              <CarouselItem
                key={service.id}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="p-1">
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleServiceClick(service.name)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={service.images?.[0]?.url || "/placeholder-image.jpg"}
                          alt={service.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <h3 className="font-semibold text-lg">
                          {service.name}
                        </h3>
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
  );
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
    window.addEventListener("load", handleStart);
    window.addEventListener("beforeunload", handleStart);

    return () => {
      window.removeEventListener("load", handleStart);
      window.removeEventListener("beforeunload", handleStart);
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
            imageUrl:
              typeof service.images?.[0] === "string"
                ? service.images[0]
                : service.images?.[0]?.url || "/placeholder-image.jpg",
            details: service.details || "",
            category: service.category || "uncategorized",
            rating: service.rating || 0,
            totalReviews: service.totalReviews || 0,
            createdAt:
              (service.createdAt instanceof Date
                ? service.createdAt.toISOString()
                : service.createdAt) || new Date().toISOString(),
            updatedAt:
              (service.updatedAt instanceof Date
                ? service.updatedAt.toISOString()
                : service.updatedAt) || new Date().toISOString(),
            provider: service.provider || null,
            servicePincodes: service.servicePincodes || [],
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
      <main
        className={`transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Header />
        <div className="relative h-screen">
          <div className="absolute inset-0 z-0 opacity-60">
            <GridMotion 
              items={items} 
              gradientColor="rgba(0, 0, 0, 0.6)"
            />
          </div>
          
          <div className="absolute inset-0 z-5 bg-black opacity-50"></div>
          
          <div className="relative z-10 h-full">
            <LandingPage />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900">
          {CATEGORY_CONFIGS.map((config, index) => (
            <ServicesCategoryCarousel 
              key={config.title} 
              config={config} 
            />
          ))}
          <div className="container mx-auto px-4 py-12">
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Browse by Category
              </h2>
              <ServiceFilters />
            </div>

            <Testimonials />

            <FAQ />
          </div>
        </div>
        <Footer />

        {selectedService && (
          <ServiceModal
            onReviewAdded={() => {}}
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
