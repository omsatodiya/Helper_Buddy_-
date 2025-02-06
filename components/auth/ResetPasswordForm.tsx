"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";

const passwordRequirements = [
  { regex: /[A-Z]/, label: "Must contain an uppercase letter" },
  { regex: /[a-z]/, label: "Must contain a lowercase letter" },
  { regex: /[0-9]/, label: "Must contain a number" },
  {
    regex: /[!@#$%^&*(),.?":{}|<>]/,
    label: "Must contain a special character",
  },
  { regex: /.{8,}/, label: "Minimum 8 characters" },
] as const;

interface FormState {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReqs, setShowReqs] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const validatePassword = (): string => {
    const failed = passwordRequirements.filter(
      (req) => !req.regex.test(formState.password)
    );
    if (failed.length) {
      return `Password needs: ${failed.map((f) => f.label).join(", ")}`;
    }
    if (formState.password !== formState.confirmPassword) {
      return "Passwords don't match";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formState.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }

      router.push("/auth/login?resetSuccess=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md ${className}`}>
        <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
          <CardContent className="pt-8 px-8 pb-8 space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Link
              href="/auth/login"
              className="block mt-4 text-center text-white hover:text-white/90 transition-colors font-lora tracking-wide">
              Back to login
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full max-w-md ${className}`}>
      <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
        <CardContent className="pt-8 px-8 pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-8">
            <h1 className="font-adallyn text-4xl text-white text-center tracking-wide">
              Reset Password
            </h1>
            <p className="text-gray-400 text-center font-adallynBold text-lg tracking-wide">
              Create a new password for your account
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                New Password
              </p>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  size={20}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  onFocus={() => setShowReqs(true)}
                  onBlur={() => setShowReqs(false)}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </motion.div>

            {showReqs && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm space-y-1 bg-white/5 p-3 rounded">
                {passwordRequirements.map(({ regex, label }) => (
                  <div
                    key={label}
                    className={
                      regex.test(formState.password)
                        ? "text-green-400"
                        : "text-white/50"
                    }>
                    {regex.test(formState.password) ? "✓" : "○"} {label}
                  </div>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Confirm Password
              </p>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  size={20}
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}>
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 font-adallynBold text-lg h-12"
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center">
            <p className="text-white/60 font-lora tracking-wide">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="text-white hover:text-white/90 transition-colors font-lora ml-1">
                Back to login
              </Link>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
