"use client";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedBackground from "@/components/AnimatedBackground";
import gsap from "gsap";

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );

    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    );

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.3"
    );

    tl.fromTo(
      contentRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    );
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      
      <div 
        ref={containerRef} 
        className="relative z-10 w-full min-h-screen py-8 md:py-12 lg:py-16 flex items-center justify-center"
      >
        <Card
          ref={cardRef}
          className="w-full max-w-[95%] sm:max-w-xl bg-white/80 backdrop-blur-md border-gray-200 shadow-lg"
        >
          <CardContent className="pt-8 px-4 sm:px-8 pb-8">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="mb-4 text-gray-600 hover:text-gray-800 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div ref={titleRef} className="space-y-2 mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-black">
                Sign Out
              </h1>
              <p className="text-sm text-gray-500">
                Are you sure you want to sign out?
              </p>
            </div>

            <div ref={contentRef} className="flex flex-col space-y-3">
              <Button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>

              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full h-11 border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 