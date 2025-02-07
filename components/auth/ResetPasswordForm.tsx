"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import gsap from "gsap";

const passwordRequirements = [
  { regex: /[A-Z]/, label: "Must contain an uppercase letter" },
  { regex: /[a-z]/, label: "Must contain a lowercase letter" },
  { regex: /[0-9]/, label: "Must contain a number" },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, label: "Must contain a special character" },
  { regex: /.{8,}/, label: "Minimum 8 characters" },
];

export function ResetPasswordForm({ 
  className = "", 
  token = "" 
}: { 
  className?: string;
  token?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [{ password, confirmPassword }, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Refs for GSAP animations
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);
  const reqsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      formRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.3"
    );

    tl.fromTo(
      inputsRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    );
  }, []);

  useEffect(() => {
    if (showReqs && reqsRef.current) {
      gsap.fromTo(
        reqsRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [showReqs]);

  const validatePassword = () => {
    const failed = passwordRequirements.filter(
      (req) => !req.regex.test(password)
    );
    if (failed.length)
      return `Password needs: ${failed.map((f) => f.label).join(", ")}`;
    if (password !== confirmPassword) return "Passwords don't match";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validatePassword();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }

      router.push("/auth/login?message=Password reset successful");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-8 md:py-12 lg:py-16">
      <Card 
        ref={formRef}
        className={`w-full max-w-[95%] sm:max-w-xl bg-white/80 backdrop-blur-md border-gray-200 shadow-lg ${className}`}
      >
        <CardContent className="pt-8 px-4 sm:px-8 pb-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/auth/login')}
            className="mb-4 text-gray-600 hover:text-gray-800 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>

          <div ref={titleRef} className="space-y-2 mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div ref={inputsRef} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-black">
                  New Password
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    onFocus={() => setShowReqs(true)}
                    onBlur={() => setShowReqs(false)}
                    disabled={isLoading}
                    required
                    className="pl-10 h-11 bg-white border-black/10 text-black placeholder:text-gray-500 focus:ring-black/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-black">
                  Confirm Password
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isLoading}
                    required
                    className="pl-10 h-11 bg-white border-black/10 text-black placeholder:text-gray-500 focus:ring-black/20"
                  />
                </div>
              </div>
            </div>

            {showReqs && (
              <div
                ref={reqsRef}
                className="space-y-1 text-xs">
                {passwordRequirements.map((req, i) => (
                  <p
                    key={i}
                    className={`${
                      req.regex.test(password)
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}>
                    {req.label}
                  </p>
                ))}
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
