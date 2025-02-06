"use client";
import { Suspense } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./LoginForm";
import { Separator } from "@/components/ui/separator";

function LoginSkeleton() {
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
        
        {/* Password field */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Sign in button */}
        <Skeleton className="h-10 w-full" />

        {/* Separator */}
        <div className="relative py-4">
          <Separator />
          <Skeleton className="h-4 w-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Google button */}
        <Skeleton className="h-10 w-full" />

        {/* Sign up link */}
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function LoginContainer({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm className={className} />
    </Suspense>
  );
}