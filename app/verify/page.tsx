"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

// Dynamically import handlers with loading fallback
const VerifyHandler = dynamic(
  () => import("@/components/auth/VerifyHandler"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-black/50 dark:text-white/50">
          Loading verification...
        </div>
      </div>
    ),
  }
);

export default function VerifyPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="container relative z-10 flex items-center justify-center min-h-screen py-8">
        <Suspense>
          <VerifyHandler />
        </Suspense>
      </div>
    </div>
  );
} 