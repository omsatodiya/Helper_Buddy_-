"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/ui/loading";

// Dynamically import AnimatedBackground with noSSR
const AnimatedBackground = dynamic(
  () => import("@/components/AnimatedBackground"),
  { ssr: false }
);

// Dynamically import LoginForm with loading state
const LoginForm = dynamic(
  () => import("@/components/auth/LoginForm"),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function Login() {
  return (
    <main className="min-h-screen relative">
      <Suspense fallback={<LoadingSpinner />}>
        <div className="absolute inset-0">
          <AnimatedBackground />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <LoginForm />
        </div>
      </Suspense>
    </main>
  );
}
