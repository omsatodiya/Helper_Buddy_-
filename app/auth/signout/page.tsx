"use client";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import gsap from "gsap";

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );

    tl.fromTo(cardRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
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
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <AnimatedBackground />
      
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-md text-center opacity-0"
      >
        <div
          ref={cardRef}
          className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-adallyn text-white mb-4">
            Sign Out
          </h1>
          
          <p className="text-white/70 mb-8 font-inter">
            Are you sure you want to sign out?
          </p>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium transition-colors"
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
              variant="ghost"
              className="w-full h-12 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 