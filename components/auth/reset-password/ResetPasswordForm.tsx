"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Link
            href="/auth/login"
            className="block mt-4 text-center text-primary hover:underline">
            Back to login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Set new password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={formState.password}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, password: e.target.value }))
              }
              onFocus={() => setShowReqs(true)}
              onBlur={() => setShowReqs(false)}
              disabled={isLoading}
              required
            />
          </div>

          {showReqs && (
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              {passwordRequirements.map(({ regex, label }) => (
                <div
                  key={label}
                  className={
                    regex.test(formState.password)
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }>
                  {regex.test(formState.password) ? "✓" : "○"} {label}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formState.confirmPassword}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
