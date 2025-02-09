import { Suspense } from "react";
import dynamic from "next/dynamic";

const VerifyEmailForm = dynamic(
  () => import("@/components/auth/VerifyEmailForm"),
  { ssr: false }
);

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
} 