"use client";
import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/fireConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ForgotPasswordForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      });
      setSuccess(true);
      setEmail("");
    } catch (error: any) {
      setError(
        error.code === "auth/user-not-found"
          ? "No account found with this email"
          : error.code === "auth/invalid-email"
          ? "Invalid email address"
          : "Failed to send reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Reset password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="space-y-4">
            <div className="p-3 rounded bg-green-50 text-green-800 text-sm">
              Check your email for reset instructions
            </div>
            <Link
              href="/login"
              className="block text-center text-primary hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Send Reset Link"}
            </Button>
            <Link
              href="/login"
              className="block text-center text-primary hover:underline">
              Back to login
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
