"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import gsap from "gsap";

export function ForgotPasswordForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

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
      contentRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    );
  }, []);

  useEffect(() => {
    if (success && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4 }
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
              Enter your email to reset your password
            </p>
          </div>

          {success ? (
            <div ref={successRef} className="space-y-6">
              <Alert className="bg-green-500/10 border-green-500/20 text-green-600">
                <AlertDescription>
                  If an account exists with this email, you will receive
                  password reset instructions.
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="w-full h-11 border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <div ref={contentRef}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black">
                    Email
                  </p>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 h-11 bg-white border-black/10 text-black placeholder:text-gray-500 focus:ring-black/20"
                    />
                  </div>
                </div>

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
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
