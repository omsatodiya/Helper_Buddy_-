import { Suspense } from "react";
import dynamic from "next/dynamic";

const ResetPasswordForm = dynamic(
  () => import("@/components/auth/ResetPasswordForm"),
  { ssr: false }
);

const AnimatedBackground = dynamic(
  () => import("@/components/AnimatedBackground"),
  { ssr: false }
);

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0">
        <Suspense>
          <AnimatedBackground />
        </Suspense>
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
