"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const AnimatedBackground = dynamic(
  () => import("@/components/AnimatedBackground"),
  { ssr: false }
);

const VerifyEmailForm = dynamic(
  () => import("@/components/auth/VerifyEmailForm"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md mx-auto animate-pulse">
        <div className="bg-white/10 dark:bg-black/10 rounded-2xl h-[400px]"></div>
      </div>
    ),
  }
);

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.replace("/auth/login");
    }
  }, [email, router]);

  if (!email) {
    return null; // Return null to prevent flash of content before redirect
  }

  return (
    <main className="min-h-screen relative">
      <Suspense>
        <div className="absolute inset-0">
          <AnimatedBackground />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <VerifyEmailForm />
        </div>
      </Suspense>
    </main>
  );
} 