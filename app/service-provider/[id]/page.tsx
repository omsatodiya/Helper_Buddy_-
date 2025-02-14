"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ServiceProviderCard from "@/components/services/ServiceProviderCard";
import ServiceCard from "@/components/services/ServiceCard";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Service, SimpleService, ServiceProvider } from "@/types/service";
import { getFirestore } from "firebase/firestore";

interface ServiceProviderPageProps {
  params: {
    id: string;
  };
}

async function getProviderData(id: string) {
  const docRef = doc(db, "providers", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    rating: data.rating || 0,
    totalServices: data.totalServices || 0,
    location: data.location,
    profileImage: data.profileImage,
    specializations: data.specializations,
  };
}

async function getProviderServices(providerId: string) {
  const servicesRef = collection(db, "services");
  const q = query(servicesRef, where("providerId", "==", providerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    description: doc.data().description,
    pricing: doc.data().pricing,
    rating: doc.data().rating,
    totalReviews: doc.data().totalReviews,
    images: doc.data().images,
  }));
}

export default function ServiceProviderPage({ params }: ServiceProviderPageProps) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderAndServices = async () => {
      try {
        const db = getFirestore();
        
        // Fetch provider data
        const providerDoc = await getDoc(doc(db, "users", params.id));
        if (providerDoc.exists()) {
          setProvider({
            id: providerDoc.id,
            ...providerDoc.data()
          } as ServiceProvider);
        }

        // Fetch services
        const servicesQuery = query(
          collection(db, "services"),
          where("providerId", "==", params.id)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching provider data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderAndServices();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!provider) {
    return <div>Provider not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ServiceProviderCard provider={provider} showContactInfo={true} />
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">
            Services by {provider.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((service: Service) => {
              const simpleService: SimpleService = {
                id: service.id,
                name: service.name,
                description: service.description || "",
                price: service.pricing?.basePrice || 0,
                details: service.details || "",
                category: service.category || "uncategorized",
                rating: service.rating || 0,
                totalReviews: service.totalReviews || 0,
                imageUrl: typeof service.images?.[0] === "string" ? service.images[0] : service.images?.[0]?.url || "/placeholder-image.jpg",
                createdAt: service.createdAt || new Date().toISOString(),
                updatedAt: service.updatedAt || new Date().toISOString()
              };
              return (
                <ServiceCard
                  key={service.id}
                  service={simpleService}
                  title={service.name}
                  description={service.description || ""}
                  price={service.pricing?.basePrice || 0}
                  imageUrl={simpleService.imageUrl}
                  rating={service.rating || 0}
                  totalRatings={service.totalReviews || 0}
                  onAddToCart={() => {}}
                  onBuyNow={() => {}}
                  onClick={() => {}}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
