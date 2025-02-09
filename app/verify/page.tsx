import { Suspense } from "react";
import VerifyEmail from "@/components/auth/VerifyEmail";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
} 