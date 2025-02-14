"use client";
import { useState, useEffect } from "react";
import ProfileForm from "@/components/profile/ProfileForm";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="h-screen flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />
      
      {isLoading ? (
        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Loading spinner */}
          <div className={`
            w-12 h-12 rounded-full
            border-4 border-t-transparent
            ${theme === "dark" ? "border-white/30" : "border-black/30"}
            animate-spin
          `} />
          
          {/* Loading text with fade in/out effect */}
          <div className={`
            text-sm font-medium animate-pulse
            ${theme === "dark" ? "text-white/70" : "text-black/70"}
          `}>
            Loading your profile...
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-2xl h-[calc(100vh-2rem)] mx-auto">
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