"use client";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
