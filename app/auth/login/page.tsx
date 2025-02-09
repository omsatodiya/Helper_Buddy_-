import AnimatedBackground from "@/components/AnimatedBackground";
import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </main>
  );
}
