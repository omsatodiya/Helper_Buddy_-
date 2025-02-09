import { Suspense } from "react";
import dynamic from "next/dynamic";

const VerifyEmailHandler = dynamic(
  () => import("@/components/auth/VerifyEmailHandler"),
  { ssr: false }
);

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyEmailHandler />
    </Suspense>
  );
} 