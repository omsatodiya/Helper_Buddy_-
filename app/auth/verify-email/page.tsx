"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/ui/loading";

const AnimatedBackground = dynamic(
  () => import("@/components/AnimatedBackground"),
  { ssr: false }
);

const VerifyEmailForm = dynamic(
  () => import("@/components/auth/VerifyEmailForm"),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

const EmailVerificationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.replace("/auth/login");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <VerifyEmailForm />
    </div>
  );
};

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen relative">
      <Suspense fallback={<LoadingSpinner />}>
        <div className="absolute inset-0">
          <AnimatedBackground />
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <EmailVerificationContent />
        </Suspense>
      </Suspense>
    </main>
  );
} 