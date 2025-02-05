"use client";
import { Suspense } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SignupForm } from "./SignupForm";
import { Separator } from "@/components/ui/separator";

function SignupSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Skeleton className="h-8 w-48 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Sign up button */}
        <Skeleton className="h-10 w-full" />

        {/* Separator */}
        <div className="relative py-4">
          <Separator />
          <Skeleton className="h-4 w-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Google button */}
        <Skeleton className="h-10 w-full" />

        {/* Sign in link */}
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function SignupContainer({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupForm className={className} />
    </Suspense>
  );
}
