"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditServiceForm from "@/components/services/EditServiceForm";
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Service } from "@/types/service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import gsap from "gsap";
import { use } from "react";

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const serviceDoc = await getDoc(doc(db, "services", resolvedParams.id));
        if (serviceDoc.exists()) {
          setService({ id: serviceDoc.id, ...serviceDoc.data() } as Service);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (pageRef.current && contentRef.current) {
      gsap.set(pageRef.current, { opacity: 0 });
      gsap.set(contentRef.current, { opacity: 0, y: 20 });

      gsap.to(pageRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: 0.2,
        ease: "power2.out",
      });
    }
  }, [service]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Service not found</h2>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-white dark:bg-black">
      <header className="sticky top-0 z-30 w-full border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="hover:bg-transparent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Edit Service</h1>
          </div>
        </div>
      </header>

      <main>
        <div ref={contentRef} className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <EditServiceForm
            service={service}
            onClose={() => router.back()}
            onServiceUpdated={() => {
              router.push("/admin/services");
              router.refresh();
            }}
          />
        </div>
      </main>
    </div>
  );
}
