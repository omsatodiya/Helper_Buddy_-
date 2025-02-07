import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <AnimatedBackground />
      <ForgotPasswordForm className="relative z-10" />
    </main>
  );
}
