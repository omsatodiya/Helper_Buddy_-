import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import Image from "next/image";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <AnimatedBackground />
      <LoginForm className="relative z-10" />
    </main>
  );
}
