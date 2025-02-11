"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

// Dynamically import both handlers
const VerifyEmailHandler = dynamic(
  () => import("@/components/auth/VerifyEmailHandler"),
  { ssr: false }
);

const ResetPasswordForm = dynamic(
  () => import("@/components/auth/ResetPasswordForm"),
  { ssr: false }
);

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Suspense>
        <div className="container relative z-10 flex items-center justify-center min-h-screen py-8">
          {mode === "resetPassword" ? (
            <ResetPasswordForm />
          ) : (
            <VerifyEmailHandler />
          )}
        </div>
      </Suspense>
    </div>
  );
} 