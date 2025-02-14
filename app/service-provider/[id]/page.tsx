import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ServiceProviderCard from "@/components/services/ServiceProviderCard";
import ServiceCard from "@/components/services/ServiceCard";
import { collection, query, where, getDocs } from "firebase/firestore";

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

export default async function ServiceProviderPage({
  params,
}: ServiceProviderPageProps) {
  const provider = await getProviderData(params.id);
  const services = await getProviderServices(params.id);

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
