"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";
import gsap from "gsap";

export function ForgotPasswordForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Refs for GSAP animations
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial animation
    const tl = gsap.timeline();
    
    tl.fromTo(formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );

    tl.fromTo(titleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      "-=0.2"
    );

    if (!success) {
      tl.fromTo(inputsRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3 },
        "-=0.1"
      );
    }
  }, [success]);

  // Success message animation
  useEffect(() => {
    if (success && successRef.current) {
      gsap.fromTo(successRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
      setEmail("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={formRef} className={`w-full max-w-md ${className}`}>
      <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
        <CardContent className="pt-8 px-4 sm:px-8 pb-8">
          <div ref={titleRef} className="space-y-3 mb-8">
            <h1 className="font-adallyn text-3xl sm:text-4xl text-white text-center tracking-wide">
              Reset Password
            </h1>
            <p className="text-gray-400 text-center text-base sm:text-lg tracking-wide">
              Enter your email to reset your password
            </p>
          </div>

          {success ? (
            <div ref={successRef} className="space-y-6">
              <Alert className="border-green-500 bg-green-500/10 text-green-400">
                <AlertDescription>
                  If an account exists with this email, you will receive
                  password reset instructions.
                </AlertDescription>
              </Alert>
              <Link
                href="/auth/login"
                className="block text-center text-white/60 hover:text-white transition-colors font-inter tracking-wide">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div ref={inputsRef} className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  Email
                </p>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                    size={20}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 pr-3 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 text-sm sm:text-base"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 font-adallynBold text-lg h-12"
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm sm:text-base tracking-wide">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-white hover:text-white/90 transition-colors ml-1">
                  Back to login
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
