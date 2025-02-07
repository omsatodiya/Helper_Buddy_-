"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useLoadingStore } from "@/store/loading-store";
import gsap from "gsap";

interface PreloaderProps {
  onLoadingComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const logoGlowRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const loadingTextRef = useRef<HTMLParagraphElement>(null);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);

  useEffect(() => {
    // Disable scrolling and pointer events on body during loading
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';

    const tl = gsap.timeline({
      onComplete: () => {
        // Re-enable scrolling and pointer events after loading
        document.body.style.overflow = 'auto';
        document.body.style.pointerEvents = 'auto';
        setIsLoading(false);
        onLoadingComplete?.();
      }
    });

    // Fade in container
    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    // Animate logo
    tl.fromTo(logoContainerRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
    );

    // Animate logo glow
    if (logoGlowRef.current) {
      gsap.to(logoGlowRef.current, {
        opacity: 0.1,
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "none"
      });
    }

    // Animate progress bar
    tl.fromTo(progressBarRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.2,
        ease: "power3.inOut"
      }
    );

    // Animate loading text
    tl.fromTo(loadingTextRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      "-=1"
    );

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
      tl.kill();
    };
  }, [onLoadingComplete, setIsLoading]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white opacity-0">
      <div ref={logoContainerRef} className="relative mb-12 opacity-0">
        <div
          ref={logoGlowRef}
          className="absolute -inset-4 rounded-full bg-black/5 blur-xl opacity-10"
        />
        <div className="relative">
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            width={120}
            height={80}
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="relative w-48 sm:w-64">
        {/* Background line */}
        <div className="h-0.5 bg-black/5 rounded-full overflow-hidden" />
        
        {/* Main progress bar */}
        <div
          ref={progressBarRef}
          className="absolute top-0 left-0 h-0.5 w-full bg-black origin-left scale-x-0"
          style={{
            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* Loading text */}
      <p
        ref={loadingTextRef}
        className="mt-8 text-black/50 text-sm tracking-wider font-light opacity-0">
        Loading...
      </p>
    </div>
  );
};

export default Preloader;
