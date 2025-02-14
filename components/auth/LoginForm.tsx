"use client";
import React, { useState, useCallback, memo, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateReferralCode, processReferral } from '@/lib/utils/referral';
import { checkAccountLockout, recordLoginAttempt, formatLockoutTime } from '@/lib/utils/accountLockout';

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
import { INDIAN_STATES } from "@/lib/constants/states";
import { getCityFromPincode } from "@/lib/utils/pincode";

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
  referralCode?: string;
}

// Memoized Input Field Component
const InputField = memo(function InputField({
  name,
  label,
  type = "text",
  value,
  onChange,
  readOnly,
  disabled,
}: {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}<span className="text-destructive">*</span>
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={disabled}
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
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    onChange(e);

    if (pincode.length === 6) {
      const data = await getCityFromPincode(pincode);
      if (data) {
        // Update city and state
        onChange({
          target: { name: 'city', value: data.city }
        } as React.ChangeEvent<HTMLInputElement>);
        
        onChange({
          target: { name: 'state', value: data.state }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          name="pincode"
          label="Pincode"
          value={userData.pincode}
          onChange={handlePincodeChange}
        />
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium">
            Gender<span className="text-destructive">*</span>
          </Label>
          <Select
            value={userData.gender}
            onValueChange={onGenderChange}
            required
          >
            <SelectTrigger id="gender" className="h-11">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          name="city"
          label="City"
          value={userData.city}
          onChange={onChange}
          readOnly
          disabled
        />
        <InputField
          name="state"
          label="State"
          value={userData.state}
          onChange={onChange}
          readOnly
          disabled
        />
      </div>
    </div>
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
  const [referralCode, setReferralCode] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | undefined>();

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
      role: "user",
      coins: 0,
      referralCode: generateReferralCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", uid), profileData);
    
    if (referralCode) {
      const success = await processReferral(referralCode, uid, loginData.email);
      if (!success) {
        setError("Invalid or already used referral code");
        return;
      }
    }

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

  // Add check for account lockout
  const checkLockout = useCallback(async (email: string) => {
    const { isLocked, remainingTime } = await checkAccountLockout(email);
    setIsLocked(isLocked);
    setLockoutTime(remainingTime);
    return isLocked;
  }, []);

  // Modify handleSubmit to include lockout checks
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if account is locked
      const locked = await checkLockout(loginData.email);
      if (locked) {
        setError(`Account temporarily locked. Try again in ${formatLockoutTime(lockoutTime!)}`);
        setLoading(false);
        return;
      }

      // Attempt login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      // Record successful login attempt
      await recordLoginAttempt(loginData.email, true);

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        router.push(`/auth/verify-email?email=${loginData.email}`);
        return;
      }

      const userExists = await checkUserExists(userCredential.user.uid);
      if (!userExists) {
        setNeedsProfile(true);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      // Record failed login attempt
      const { isLocked, remainingTime } = await recordLoginAttempt(loginData.email, false);
      
      if (isLocked) {
        setError(`Too many failed attempts. Account locked for ${formatLockoutTime(remainingTime!)}`);
      } else {
        setError(err.message || "Failed to log in");
      }
    } finally {
      setLoading(false);
    }
  };

  // Add effect to check lockout status when email changes
  useEffect(() => {
    if (loginData.email) {
      checkLockout(loginData.email);
    }
  }, [loginData.email, checkLockout]);

  return (
    <div className="w-full">
      <Card className="max-w-md w-full mx-auto border-0 shadow-xl bg-background/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {!needsProfile ? (
              <>
                <div className="space-y-4">
                  <LoginFields loginData={loginData} onChange={handleLoginChange} />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  <div className="relative h-[1px] bg-border">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="px-2 bg-background text-xs text-muted-foreground">
                        or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={handleGoogleSignIn}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                      <span>Google</span>
                    </div>
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-shake">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <>
                <ProfileFields
                  userData={userData}
                  onChange={handleUserDataChange}
                  onGenderChange={handleGenderChange}
                />

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Have a referral code?</Label>
                  <Input
                    id="referralCode"
                    name="referralCode"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code (optional)"
                    className="h-10"
                  />
                </div>
                
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
