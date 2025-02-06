"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const passwordRequirements = [
  { regex: /[A-Z]/, label: "Must contain an uppercase letter" },
  { regex: /[a-z]/, label: "Must contain a lowercase letter" },
  { regex: /[0-9]/, label: "Must contain a number" },
  {
    regex: /[!@#$%^&*(),.?":{}|<>]/,
    label: "Must contain a special character",
  },
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
      const result = await signIn("credentials", {
        email,
        password,
        name,
        redirect: false,
      });

      if (result?.error) {
        setError("Signup failed. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "email" && (
          <form onSubmit={sendOTP} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={isLoading}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, otp: e.target.value }))
                }
                disabled={isLoading}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                disabled={isLoading}
                onFocus={() => setShowReqs(true)}
                onBlur={() => setShowReqs(false)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
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
                      regex.test(password)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }>
                    {regex.test(password) ? "✓" : "○"} {label}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        )}

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
