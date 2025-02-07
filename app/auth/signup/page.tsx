import { SignupForm } from "@/components/auth/SignupForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center">
      <AnimatedBackground />
      <SignupForm className="relative z-10" />
    </main>
  );
}
