"use client";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gender: string;
}

interface ValidationErrors {
  password?: string[];
  confirmPassword?: string;
}

export default function SignupForm() {
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gender: "",
  });
  const [error, setError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password))
      errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(password))
      errors.push("Password must contain at least one number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push("Password must contain at least one special character");
    return errors;
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password" || name === "confirmPassword") {
      setValidationErrors({});
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        router.push("/");
        return;
      }

      setIsGoogleUser(true);
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred with Google sign-in"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    const passwordErrors = validatePassword(formData.password);
    if (!isGoogleUser && passwordErrors.length > 0) {
      setValidationErrors((prev) => ({ ...prev, password: passwordErrors }));
      return;
    }

    if (!isGoogleUser && formData.password !== formData.confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    setLoading(true);

    try {
      let userId = auth.currentUser?.uid;

      if (!isGoogleUser) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        userId = userCredential.user.uid;

        await updateProfile(userCredential.user, {
          displayName: `${formData.firstName} ${formData.lastName}`,
        });
      }

      if (!userId) throw new Error("No user ID available");

      const db = getFirestore();
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gender: formData.gender,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", userId), userData);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    name,
    label,
    type = "text",
    disabled = false,
  }: {
    name: keyof FormData;
    label: string;
    type?: string;
    disabled?: boolean;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={(e) => handleChange(name, e.target.value)}
        disabled={disabled}
        required
        className="h-10"
      />
    </div>
  );

  return (
    <Card className="w-[95%] max-w-4xl mx-auto border-0 shadow-xl bg-white/95 backdrop-blur-xl ring-1 ring-black/5">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 mr-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Button>
          <CardTitle className="text-xl sm:text-2xl font-bold flex-1 text-center pr-8">
            Create your account
          </CardTitle>
        </div>
        <p className="text-center text-muted-foreground text-sm px-4">
          Fill in your details to get started
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Column */}
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField name="firstName" label="First Name" />
                <InputField name="lastName" label="Last Name" />
              </div>

              <InputField
                name="email"
                label="Email address"
                type="email"
                disabled={isGoogleUser}
              />

              {!isGoogleUser && (
                <>
                  <InputField name="password" label="Password" type="password" />
                  <InputField
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                  />
                </>
              )}

              <InputField name="mobile" label="Mobile Number" type="tel" />
            </div>

            {/* Right Column */}
            <div className="space-y-4 lg:space-y-6">
              <InputField name="address" label="Address" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField name="city" label="City" />
                <InputField name="state" label="State" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField name="pincode" label="Pincode" />
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) => handleChange("gender", value)}>
                    <SelectTrigger className="h-10">
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
            </div>
          </div>

          {validationErrors.password && (
            <Alert variant="destructive" className="animate-shake mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.password.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.confirmPassword && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationErrors.confirmPassword}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Creating account...</span>
                </div>
              ) : (
                <span className="text-sm sm:text-base">Create Account</span>
              )}
            </Button>

            {!isGoogleUser && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm sm:text-base bg-white hover:bg-gray-50 text-black font-medium border border-gray-200 transition-colors"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
