"use client";
import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingCard() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function ResetPasswordContainer({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<LoadingCard />}>
      <ResetPasswordForm className={className} />
    </Suspense>
  );
}