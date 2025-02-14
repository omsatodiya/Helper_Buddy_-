"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ServiceProviderCard from "@/components/services/ServiceProviderCard";
import ServiceCard from "@/components/services/ServiceCard";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Service, SimpleService, ServiceProvider } from "@/types/service";
import { getFirestore } from "firebase/firestore";
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

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

  useEffect(() => {
    if (provider) {
      // Add structured data for the service provider
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `https://dudhkela.com${pathname}`,
        name: provider.name,
        image: provider.profileImage,
        email: provider.email,
        telephone: provider.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: provider.location?.city,
          addressRegion: provider.location?.state,
          postalCode: provider.location?.pincode,
          addressCountry: 'IN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: provider.location?.latitude,
          longitude: provider.location?.longitude
        },
        aggregateRating: provider.rating ? {
          '@type': 'AggregateRating',
          ratingValue: provider.rating,
          reviewCount: provider.totalReviews || 0,
          bestRating: 5,
          worstRating: 1
        } : undefined,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Services by ${provider.name}`,
          itemListElement: services.map(service => ({
            '@type': 'Service',
            name: service.name,
            description: service.description,
            offers: {
              '@type': 'Offer',
              price: service.pricing?.basePrice,
              priceCurrency: 'INR'
            }
          }))
        }
      };

      // Add structured data to the page
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [provider, services, pathname]);

  // Add meta tags dynamically
  useEffect(() => {
    if (provider) {
      // Update meta tags
      document.title = `${provider.name} - Service Provider | Dudh-Kela`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `Book services from ${provider.name}. Specializing in ${provider.specializations?.join(', ')}. Rated ${provider.rating}/5 based on ${provider.totalReviews} reviews.`
        );
      }

      // Update OpenGraph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');

      if (ogTitle) ogTitle.setAttribute('content', `${provider.name} - Service Provider | Dudh-Kela`);
      if (ogDescription) ogDescription.setAttribute('content', 
        `Book quality dairy services from ${provider.name}. Professional service provider on Dudh-Kela.`
      );
      if (ogImage && provider.profileImage) ogImage.setAttribute('content', provider.profileImage);
    }
  }, [provider]);

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
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.name}
                price={service.pricing?.basePrice || 0}
                rating={service.rating}
                totalRatings={service.totalReviews}
                description={service.description}
                imageUrl={service.images?.[0]?.url}
                onAddToCart={() => {}}
                onBuyNow={() => {}}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
