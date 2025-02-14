"use client";
import { useState, useEffect, useRef } from "react";
import ProfileForm from "@/components/profile/ProfileForm";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTheme } from "next-themes";
import gsap from "gsap";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const spinnerRef = useRef<HTMLDivElement>(null);
  const loadingTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Setup GSAP animations
  useEffect(() => {
    // Loading spinner animation
    if (spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotate: 360,
        duration: 1,
        repeat: -1,
        ease: "none"
      });
    }

    // Loading text animation
    if (loadingTextRef.current) {
      gsap.to(loadingTextRef.current, {
        opacity: 0.5,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, []);

  // Handle loading state transition
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        // Fade out loading elements
        gsap.to([spinnerRef.current, loadingTextRef.current], {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            setIsLoading(false);
            // Fade in content
            gsap.fromTo(contentRef.current, 
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
            );
          }
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="h-screen flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />
      
      {isLoading ? (
        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Loading spinner */}
          <div 
            ref={spinnerRef}
            className={`
              w-12 h-12 rounded-full
              border-4 border-t-transparent
              ${theme === "dark" ? "border-white/30" : "border-black/30"}
            `} 
          />
          
          {/* Loading text */}
          <div 
            ref={loadingTextRef}
            className={`
              text-sm font-medium
              ${theme === "dark" ? "text-white/70" : "text-black/70"}
            `}
          >
            Loading your profile...
          </div>
        </div>
      ) : (
        <div 
          ref={contentRef} 
          className="relative z-10 w-full max-w-2xl h-[calc(100vh-2rem)] mx-auto opacity-0"
        >
          <div className={`
            h-full overflow-y-auto rounded-xl
            ${theme === "dark" 
              ? "bg-black/40 border border-white/10" 
              : "bg-white/40 border border-black/10"
            }
            backdrop-blur-md shadow-2xl
          `}>
            <div className="p-6">
              <ProfileForm />
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 