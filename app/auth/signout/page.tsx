import SignOutForm from "@/components/auth/SignOutForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function SignOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="relative z-10">
        <SignOutForm />
      </div>
    </div>
  );
} 