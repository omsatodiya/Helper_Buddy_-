"use client";
import React, { useState, useCallback, memo } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoginData {
  email: string;
  password: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gender: string;
}

// Memoized Input Field Component
const InputField = memo(function InputField({
  name,
  label,
  type = "text",
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="h-11"
        required
      />
    </div>
  );
});

// Form Container Components
const LoginFields = memo(function LoginFields({
  loginData,
  onChange,
}: {
  loginData: LoginData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <InputField
        name="email"
        label="Email address"
        type="email"
        value={loginData.email}
        onChange={onChange}
      />
      <InputField
        name="password"
        label="Password"
        type="password"
        value={loginData.password}
        onChange={onChange}
      />
    </>
  );
});

const ProfileFields = memo(function ProfileFields({
  userData,
  onChange,
  onGenderChange,
}: {
  userData: UserData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenderChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <InputField
          name="firstName"
          label="First Name"
          value={userData.firstName}
          onChange={onChange}
        />
        <InputField
          name="lastName"
          label="Last Name"
          value={userData.lastName}
          onChange={onChange}
        />
      </div>

      <InputField
        name="mobile"
        label="Mobile Number"
        type="tel"
        value={userData.mobile}
        onChange={onChange}
      />
      <InputField
        name="address"
        label="Address"
        value={userData.address}
        onChange={onChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          name="city"
          label="City"
          value={userData.city}
          onChange={onChange}
        />
        <InputField
          name="state"
          label="State"
          value={userData.state}
          onChange={onChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          name="pincode"
          label="Pincode"
          value={userData.pincode}
          onChange={onChange}
        />
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={userData.gender} onValueChange={onGenderChange}>
            <SelectTrigger>
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
    </>
  );
});

export default function LoginForm() {
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gender: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const handleLoginChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLoginData((prev) => ({ ...prev, [name]: value }));
      setError("");
    },
    []
  );

  const handleUserDataChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setUserData((prev) => ({ ...prev, [name]: value }));
      setError("");
    },
    []
  );

  const handleGenderChange = useCallback((value: string) => {
    setUserData((prev) => ({ ...prev, gender: value }));
  }, []);

  // Rest of the functions remain the same
  const checkUserExists = async (uid: string): Promise<boolean> => {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists();
  };

  const saveUserProfile = async (uid: string) => {
    const db = getFirestore();
    const profileData = {
      ...userData,
      email: loginData.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", uid), profileData);
    if (!isGoogleUser) {
      await updateProfile(auth.currentUser!, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userExists = await checkUserExists(result.user.uid);
      if (userExists) {
        router.push("/");
        return;
      }

      setIsGoogleUser(true);
      setNeedsProfile(true);
      setLoginData((prev) => ({ ...prev, email: result.user.email || "" }));

      if (result.user.displayName) {
        const names = result.user.displayName.split(" ");
        setUserData((prev) => ({
          ...prev,
          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",
        }));
      }
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
    setLoading(true);

    try {
      if (!needsProfile) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          loginData.email,
          loginData.password
        );

        const userExists = await checkUserExists(userCredential.user.uid);
        if (userExists) {
          router.push("/");
          return;
        }

        setNeedsProfile(true);
      } else {
        if (!auth.currentUser) throw new Error("No authenticated user found");
        await saveUserProfile(auth.currentUser.uid);
        router.push("/");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      if (errorMessage.includes("auth/invalid-credential")) {
        setError("Invalid email or password");
      } else if (errorMessage.includes("auth/too-many-requests")) {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="max-w-md w-full mx-auto border-0 shadow-xl bg-white/95 backdrop-blur-xl ring-1 ring-black/5">
        <CardHeader className="space-y-3 pb-2">
          {!needsProfile ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 mr-2"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to home</span>
              </Button>
              <CardTitle className="text-2xl font-bold flex-1 text-center pr-8">
                Welcome back
              </CardTitle>
            </div>
          ) : (
            <CardTitle className="text-center text-2xl font-bold">
              Complete Your Profile
            </CardTitle>
          )}
          {!needsProfile && (
            <p className="text-center text-muted-foreground text-sm">
              Enter your credentials to access your account
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!needsProfile ? (
              <>
                <LoginFields loginData={loginData} onChange={handleLoginChange} />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="relative my-6">
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
                  className="w-full h-11 bg-white hover:bg-gray-50 text-black font-medium border border-gray-200 transition-colors"
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
            ) : (
              <>
                <ProfileFields
                  userData={userData}
                  onChange={handleUserDataChange}
                  onGenderChange={handleGenderChange}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving profile...
                    </div>
                  ) : (
                    "Complete Profile"
                  )}
                </Button>
              </>
            )}

            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        
        {!needsProfile && (
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="text-primary hover:underline font-medium"
              >
                Create one
              </Link>
            </p>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline font-medium"
            >
              Forgot your password?
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
