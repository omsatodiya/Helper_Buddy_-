"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Loader2 } from "lucide-react";
import gsap from "gsap";

export function LoginForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [{ email, password }, setForm] = useState({
    email: "",
    password: "",
  });

  // Refs for GSAP animations
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);

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

    tl.fromTo(inputsRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3 },
      "-=0.1"
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`bg-black/30 backdrop-blur-sm border border-white/10 ${className}`}>
      <CardContent className="pt-8 px-8 pb-8" ref={formRef}>
        <div ref={titleRef} className="space-y-3 mb-8">
          <h1 className="font-adallyn text-4xl text-white text-center tracking-wide">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-center font-adallynBold text-lg tracking-wide">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div ref={inputsRef} className="space-y-4">
            <div className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Email
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white/80 font-inter text-sm tracking-wide">
                  Password
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="text-white/60 hover:text-white text-sm transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            {/* <span className="w-full border-t border-white/10" /> */}
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-white/60">
              Don't have an account?
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/auth/signup"
            className="text-white/80 hover:text-white transition-colors">
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}