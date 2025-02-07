"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import gsap from "gsap";

const passwordRequirements = [
  { regex: /[A-Z]/, label: "Must contain an uppercase letter" },
  { regex: /[a-z]/, label: "Must contain a lowercase letter" },
  { regex: /[0-9]/, label: "Must contain a number" },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, label: "Must contain a special character" },
  { regex: /.{8,}/, label: "Minimum 8 characters" },
];

export function SignupForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "details">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [{ name, email, password, confirmPassword, otp }, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [error, setError] = useState("");

  // Refs for GSAP animations
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);
  const reqsRef = useRef<HTMLDivElement>(null);

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

  // Password requirements animation
  useEffect(() => {
    if (showReqs && reqsRef.current) {
      gsap.fromTo(reqsRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  }, [showReqs]);

  const sendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setStep("otp");
        setError("");
      } else {
        setError("Failed to send verification code");
      }
    } catch (err) {
      setError("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "PUT",
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setStep("details");
        setError("");
      } else {
        setError("Invalid verification code");
      }
    } catch (err) {
      setError("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = () => {
    const failed = passwordRequirements.filter(
      (req) => !req.regex.test(password)
    );
    if (failed.length)
      return `Password needs: ${failed.map((f) => f.label).join(", ")}`;
    if (password !== confirmPassword) return "Passwords don't match";
    return "";
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validatePassword();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    try {
      // First create the user
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create account");
      }

      // Then sign in
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`bg-black/30 backdrop-blur-sm border border-white/10 ${className}`}>
      <CardContent className="pt-8 px-8 pb-8" ref={formRef}>
        <div ref={titleRef} className="space-y-3 mb-8">
          <h1 className="font-adallyn text-4xl text-white text-center tracking-wide">
            Create Account
          </h1>
          <p className="text-gray-400 text-center font-adallynBold text-lg tracking-wide">
            Join our community today
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={sendOTP} className="space-y-6">
            <div ref={inputsRef} className="space-y-2">
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
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOTP} className="space-y-6">
            <div ref={inputsRef} className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Verification Code
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setForm((prev) => ({ ...prev, otp: e.target.value }))}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
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
              className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={handleSignup} className="space-y-6">
            <div ref={inputsRef} className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Full Name
              </p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </div>

            <div ref={inputsRef} className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Password
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  onFocus={() => setShowReqs(true)}
                  onBlur={() => setShowReqs(false)}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </div>

            <div ref={inputsRef} className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Confirm Password
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </div>

            {showReqs && (
              <div
                ref={reqsRef}
                className="text-sm space-y-1 bg-white/5 p-4 rounded-lg border border-white/10">
                {passwordRequirements.map(({ regex, label }) => (
                  <div
                    key={label}
                    className={regex.test(password) ? "text-green-400" : "text-white/50"}>
                    {regex.test(password) ? "✓" : "○"} {label}
                  </div>
                ))}
              </div>
            )}

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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        )}

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            {/* <span className="w-full border-t border-white/10" /> */}
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-white/60">
              Already have an account?
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-white/80 hover:text-white transition-colors">
            Sign in to your account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
