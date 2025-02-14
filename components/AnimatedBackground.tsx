"use client";
import React from "react";
import { useTheme } from "next-themes";

const AnimatedBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base background */}
      <div 
        className={`
          absolute inset-0 
          ${theme === "dark" ? "bg-black" : "bg-white"}
          transition-colors duration-500
        `}
      />

      {/* Gradient overlay */}
      <div 
        className={`
          absolute inset-0 
          ${theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"
            : "bg-[radial-gradient(circle_at_center,_transparent_0%,_#fff_100%)]"}
          opacity-60
          transition-colors duration-500
        `}
      />

      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute top-1/4 left-1/4 w-96 h-96 rounded-full 
          animate-blob
          ${theme === "dark" 
            ? "bg-white/[0.03] mix-blend-overlay" 
            : "bg-black/[0.02] mix-blend-multiply"}
          blur-3xl
        `} />
        <div className={`
          absolute top-1/3 right-1/4 w-96 h-96 rounded-full 
          animate-blob animation-delay-2000
          ${theme === "dark" 
            ? "bg-white/[0.03] mix-blend-overlay" 
            : "bg-black/[0.02] mix-blend-multiply"}
          blur-3xl
        `} />
        <div className={`
          absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full 
          animate-blob animation-delay-4000
          ${theme === "dark" 
            ? "bg-white/[0.03] mix-blend-overlay" 
            : "bg-black/[0.02] mix-blend-multiply"}
          blur-3xl
        `} />
      </div>

      {/* Grid pattern */}
      <div 
        className={`
          absolute inset-0 
          ${theme === "dark"
            ? "bg-grid-white/[0.03]"
            : "bg-grid-black/[0.02]"}
          bg-[length:50px_50px]
          transition-opacity duration-500
        `}
      />

      {/* Noise texture */}
      <div 
        className={`
          absolute inset-0 
          bg-noise
          ${theme === "dark"
            ? "opacity-[0.3]"
            : "opacity-[0.15]"}
          transition-opacity duration-500
        `}
      />

      {/* Vignette */}
      <div 
        className={`
          absolute inset-0 
          ${theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"
            : "bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"}
          ${theme === "dark"
            ? "opacity-80"
            : "opacity-20"}
          transition-opacity duration-500
          pointer-events-none
        `}
      />
    </div>
  );
};

export default AnimatedBackground;

// Add this to your globals.css:
/*
@layer utilities {
  .bg-radial-gradient-dark {
    background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  }

  .bg-radial-gradient-light {
    background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.05) 100%);
  }

  .bg-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
  }

  .bg-grid-dark {
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .bg-grid-light {
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .bg-vignette {
    background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
  }
}
*/
