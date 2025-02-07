"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2 } from "lucide-react";
import gsap from "gsap";

const passwordRequirements = [
  { regex: /[A-Z]/, label: "Must contain an uppercase letter" },
  { regex: /[a-z]/, label: "Must contain a lowercase letter" },
  { regex: /[0-9]/, label: "Must contain a number" },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, label: "Must contain a special character" },
  { regex: /.{8,}/, label: "Minimum 8 characters" },
];

export function ResetPasswordForm({ token, className = "" }: { token: string; className?: string }) {
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
    <div ref={formRef} className={`w-full max-w-md ${className}`}>
      <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
        <CardContent className="pt-8 px-8 pb-8">
          <div ref={titleRef} className="space-y-3 mb-8">
            <h1 className="font-adallyn text-4xl text-white text-center tracking-wide">
              Reset Password
            </h1>
            <p className="text-gray-400 text-center text-lg tracking-wide">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div ref={inputsRef} className="space-y-4">
              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  New Password
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
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

              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  Confirm Password
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
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
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-white/80 hover:text-white transition-colors">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
