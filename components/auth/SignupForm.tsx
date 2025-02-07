"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Lock, User, Phone, MapPin, Loader2 } from "lucide-react";
import gsap from "gsap";

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

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  mobile: string;
  gender: string;
  password: string;
  confirmPassword: string;
  otp: string;
};

export function SignupForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "details">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    mobile: "",
    gender: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [error, setError] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);
  const reqsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
    tl.fromTo(
      titleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      "-=0.2"
    );
    tl.fromTo(
      inputsRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3 },
      "-=0.1"
    );
  }, []);

  useEffect(() => {
    if (showReqs && reqsRef.current) {
      gsap.fromTo(
        reqsRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  }, [showReqs]);

  const updateForm = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const sendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email: formState.email }),
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
        body: JSON.stringify({ email: formState.email, otp: formState.otp }),
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

  const validateForm = () => {
    if (!/^\d{10}$/.test(formState.mobile)) {
      return "Please enter a valid 10-digit mobile number";
    }
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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
          firstName: formState.firstName,
          lastName: formState.lastName,
          address: formState.address,
          city: formState.city,
          state: formState.state,
          mobile: formState.mobile,
          gender: formState.gender,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create account");
      }

      const result = await signIn("credentials", {
        email: formState.email,
        password: formState.password,
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
    <Card
      className={`bg-black/30 backdrop-blur-sm border border-white/10 ${className}`}>
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
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  size={20}
                />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formState.email}
                  onChange={(e) => updateForm("email", e.target.value)}
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
              disabled={isLoading}>
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
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={formState.otp}
                  onChange={(e) => updateForm("otp", e.target.value)}
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
              disabled={isLoading}>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  First Name
                </p>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="First name"
                    value={formState.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  Last Name
                </p>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="Last name"
                    value={formState.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Address
              </p>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Street address"
                  value={formState.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  City
                </p>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="City"
                    value={formState.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  State
                </p>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="State"
                    value={formState.state}
                    onChange={(e) => updateForm("state", e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  Mobile
                </p>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                    size={20}
                  />
                  <Input
                    type="tel"
                    placeholder="Mobile number"
                    value={formState.mobile}
                    onChange={(e) => updateForm("mobile", e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                  Gender
                </p>
                <Select
                  value={formState.gender}
                  onValueChange={(value: string) => updateForm("gender", value)}
                  disabled={isLoading}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Password
              </p>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  size={20}
                />
                <Input
                  type="password"
                  placeholder="Create password"
                  value={formState.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  onFocus={() => setShowReqs(true)}
                  onBlur={() => setShowReqs(false)}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                />
              </div>
              {showReqs && (
                <div ref={reqsRef} className="mt-2 space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <p
                      key={i}
                      className={`text-sm ${
                        req.regex.test(formState.password)
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}>
                      {req.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-white/80 font-inter mb-2 text-sm tracking-wide">
                Confirm Password
              </p>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  size={20}
                />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    updateForm("confirmPassword", e.target.value)
                  }
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
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
