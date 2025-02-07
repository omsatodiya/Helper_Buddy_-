import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <AnimatedBackground />
      <ResetPasswordForm className="relative z-10" token={searchParams.token || ""} />
    </main>
  );
}
