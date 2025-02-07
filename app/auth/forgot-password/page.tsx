import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Image from "next/image";
import AnimatedBackground from "@/components/AnimatedBackground";

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
      <ForgotPasswordForm className="relative z-10" />
    </main>
  );
}
