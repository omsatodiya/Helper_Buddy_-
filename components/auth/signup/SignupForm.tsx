"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { auth } from "@/app/fireConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const passwordRequirements = [
  { regex: /[A-Z]/, label: "Must contain an uppercase letter" },
  { regex: /[a-z]/, label: "Must contain a lowercase letter" },
  { regex: /[0-9]/, label: "Must contain a number" },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, label: "Must contain a special character" },
  { regex: /.{8,}/, label: "Minimum 8 characters" },
];

export function SignupForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [{ name, email, password, confirmPassword }, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

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
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(user, { displayName: name });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "Email already registered"
          : "Signup failed. Please try again."
      );
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: "name", label: "Full Name", type: "text", value: name },
            { id: "email", label: "Email", type: "email", value: email },
            {
              id: "password",
              label: "Password",
              type: "password",
              value: password,
              onFocus: () => setShowReqs(true),
              onBlur: () => setShowReqs(false),
            },
            {
              id: "confirmPassword",
              label: "Confirm Password",
              type: "password",
              value: confirmPassword,
            },
          ].map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type}
                value={field.value}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                disabled={isLoading}
                onFocus={field.onFocus}
                onBlur={field.onBlur}
                required
              />
            </div>
          ))}

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
            {isLoading ? "Loading..." : "Sign Up"}
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-muted-foreground text-sm">
            Or
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
          disabled={isLoading}
          className="w-full">
          <FcGoogle className="mr-2" /> Google
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
