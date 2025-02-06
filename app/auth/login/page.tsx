import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login/LoginForm";
import Image from "next/image";
import AnimatedBackground from "../../../components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Login | Helper Buddy",
  description: "Login to your Helper Buddy account",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md mb-8 flex justify-center">
        <Image
          src="/images/logo2.png"
          alt="Helper Buddy Logo"
          width={120}
          height={80}
          className="object-contain"
          priority
        />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm className="relative z-10" />
      </Suspense>
    </main>
  );
}
