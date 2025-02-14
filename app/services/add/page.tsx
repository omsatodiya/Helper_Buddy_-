"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddServiceForm from "@/components/services/AddServiceForm";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AddServicePage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Page fade in
    gsap.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    // Content slide up and fade in
    gsap.fromTo(contentRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" }
    );

    // Cleanup function
    return () => {
      gsap.killTweensOf(pageRef.current);
      gsap.killTweensOf(contentRef.current);
    };
  }, []);

  return (
    <div 
      ref={pageRef}
      className="min-h-screen bg-white dark:bg-black opacity-0"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-black dark:text-white" />
              <span className="sr-only">Go back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-black dark:text-white">
                Add New Service
              </h1>
              <p className="text-sm text-black/60 dark:text-white/60">
                Create a new service listing
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div 
          ref={contentRef}
          className="max-w-4xl mx-auto px-4 py-8 md:py-12 opacity-0"
        >
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Content */}
            <div className="relative space-y-6">
              {/* Form Container */}
              <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-[0_0_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_0_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.1)]">
                <div className="p-6 md:p-8">
                  {/* Form Header */}
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-black dark:text-white mb-2">
                      Service Details
                    </h2>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Fill in the information below to create a new service listing.
                    </p>
                  </div>

                  {/* Service Form */}
                  <AddServiceForm
                    isOpen={true}
                    onClose={() => {
                      // Fade out animation before navigation
                      gsap.to(pageRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => router.back()
                      });
                    }}
                    onServiceAdded={() => {
                      // Fade out animation before navigation
                      gsap.to(pageRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                          router.push("/admin");
                          router.refresh();
                        }
                      });
                    }}
                  />
                </div>
              </div>

              {/* Help Text */}
              <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.02] p-4 text-sm">
                <p className="text-black/60 dark:text-white/60">
                  Need help? Check out our{" "}
                  <button className="text-black dark:text-white underline underline-offset-4 hover:opacity-70 transition-opacity">
                    service listing guidelines
                  </button>
                  {" "}or{" "}
                  <button className="text-black dark:text-white underline underline-offset-4 hover:opacity-70 transition-opacity">
                    contact support
                  </button>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 dark:border-white/10 bg-white dark:bg-black py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-black/40 dark:text-white/40">
            Make sure all information is accurate before submitting
          </p>
        </div>
      </footer>
    </div>
  );
}
