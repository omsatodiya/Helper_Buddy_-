import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[200px]">
      <Loader2 
        className={cn("animate-spin text-black/60 dark:text-white/60", className)} 
        size={size}
      />
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">Loading...</p>
    </div>
  );
} 