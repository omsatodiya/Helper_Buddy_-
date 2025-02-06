"use client";
import { Suspense } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

function ForgotPasswordSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Skeleton className="h-8 w-48 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full" />

        {/* Back to login link */}
        <Skeleton className="h-4 w-32 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function ForgotPasswordContainer({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <ForgotPasswordForm className={className} />
    </Suspense>
  );
}
