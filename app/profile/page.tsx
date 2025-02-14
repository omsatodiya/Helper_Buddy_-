"use client";
import { useState, useEffect, memo, useRef } from "react";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Coins, Copy, Check, LayoutDashboard, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import AnimatedBackground from "@/components/AnimatedBackground";
import { INDIAN_STATES } from "@/lib/constants/states";
import { getCityFromPincode } from "@/lib/utils/pincode";
import gsap from "gsap";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gender: string;
  coins: number;
  referralCode: string;
  role: string;
}

// Memoize the InputField component
const InputField = memo(function InputField({
  name,
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
}: {
  name: keyof UserData;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10"
      />
    </div>
  );
});

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gender: "",
    coins: 0,
    referralCode: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Add refs for GSAP animations
  const loadingRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const accountCardRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const deleteDialogRef = useRef<HTMLDivElement>(null);

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, [setTheme]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
          setIsAdmin(userDoc.data().role === 'admin');
        }
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
      } else {
        fetchUserData();
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Add animation effects
  useEffect(() => {
    if (loading || !mounted) {
      // Loading animation
      if (loadingRef.current) {
        gsap.fromTo(loadingRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
        );
      }
    } else {
      // Content reveal animations
      const tl = gsap.timeline();

      if (headerRef.current) {
        tl.fromTo(headerRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
        );
      }

      if (accountCardRef.current && infoCardRef.current) {
        tl.fromTo([accountCardRef.current, infoCardRef.current],
          { y: 30, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.6, 
            stagger: 0.1, 
            ease: "power3.out" 
          },
          "-=0.3"
        );
      }
    }
  }, [loading, mounted]);

  // Add hover animations for buttons
  const handleHoverScale = (target: HTMLElement) => {
    gsap.to(target, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleHoverScaleExit = (target: HTMLElement) => {
    gsap.to(target, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleInputChange = async (name: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));

    if (name === 'pincode' && value.length === 6) {
      const data = await getCityFromPincode(value);
      if (data) {
        setUserData(prev => ({
          ...prev,
          city: data.city,
          state: data.state
        }));
      }
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const db = getFirestore();
      await updateDoc(doc(db, "users", user.uid), {
        ...userData,
        updatedAt: new Date().toISOString(),
      });

      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const db = getFirestore();
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      
      router.push("/");
    } catch (err) {
      setError("Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const copyReferralCode = async () => {
    if (!userData?.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(userData.referralCode);
      setCopied(true);
      setCopyStatus('Copied!');
      setTimeout(() => {
        setCopied(false);
        setCopyStatus('');
      }, 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  // Show loading spinner
  if (loading || !mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div 
          ref={loadingRef}
          className="relative z-10 w-full max-w-7xl"
        >
          <div className={`
            rounded-xl bg-background/95 backdrop-blur-xl p-8
            ${theme === "dark" ? "border border-white/10" : "border border-black/10"}
            shadow-2xl flex flex-col items-center justify-center gap-4
          `}>
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="absolute inset-0 h-8 w-8 animate-ping opacity-20 rounded-full bg-primary" />
            </div>
            <p className="text-base text-muted-foreground animate-pulse">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-0 sm:px-4 pt-16 sm:pt-24 pb-8">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-7xl space-y-4 sm:space-y-6">
        {/* Header Card */}
        <div 
          ref={headerRef}
          className={`
            rounded-none sm:rounded-xl bg-background/95 backdrop-blur-xl px-4 py-4 sm:p-6
            ${theme === "dark" ? "border-b sm:border border-white/10" : "border-b sm:border border-black/10"}
            shadow-lg sm:shadow-2xl
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to home</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Manage your account and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin && (
                <Button
                  className="hidden sm:flex bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  onClick={() => router.push('/admin')}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    router.push("/");
                  } catch (err) {
                    setError("Failed to sign out");
                  }
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
          {/* Account Overview Card */}
          <div 
            ref={accountCardRef}
            className={`
              col-span-1 rounded-xl bg-background/95 backdrop-blur-xl p-4 sm:p-6
              ${theme === "dark" ? "border border-white/10" : "border border-black/10"}
              shadow-lg sm:shadow-2xl space-y-4 sm:space-y-6
            `}
          >
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-base sm:text-lg font-semibold">Account Overview</h2>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Available Coins</p>
                      <p className="text-xl sm:text-2xl font-bold">{userData.coins}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-black/5 dark:bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Referral Code</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyReferralCode}
                      className="h-8 px-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copyStatus && (
                        <span className="ml-2 text-xs sm:text-sm">{copyStatus}</span>
                      )}
                    </Button>
                  </div>
                  <code className="text-base sm:text-lg font-mono break-all">{userData.referralCode}</code>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full h-9 sm:h-10 text-sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>

          {/* Personal Information Card */}
          <div 
            ref={infoCardRef}
            className={`
              lg:col-span-2 rounded-xl bg-background/95 backdrop-blur-xl
              ${theme === "dark" ? "border border-white/10" : "border border-black/10"}
              shadow-lg sm:shadow-2xl
            `}
          >
            <div className="p-4 sm:p-6 border-b flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold">Personal Information</h2>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                className="h-8 sm:h-9 text-xs sm:text-sm"
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Edit Profile"
                )}
              </Button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Full Name</Label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Input
                          value={userData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="First Name"
                          className="h-9 sm:h-10 text-sm"
                        />
                        <Input
                          value={userData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Last Name"
                          className="h-9 sm:h-10 text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg font-medium">{userData.firstName} {userData.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Email Address</Label>
                    <p className="text-base sm:text-lg font-medium break-all">{userData.email}</p>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Mobile Number</Label>
                    {isEditing ? (
                      <Input
                        value={userData.mobile}
                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                        placeholder="Mobile Number"
                        className="h-9 sm:h-10 text-sm"
                      />
                    ) : (
                      <p className="text-base sm:text-lg font-medium">{userData.mobile}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Gender</Label>
                    {isEditing ? (
                      <Select
                        value={userData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-base sm:text-lg font-medium capitalize">{userData.gender}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Address</Label>
                    {isEditing ? (
                      <Input
                        value={userData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Address"
                        className="h-9 sm:h-10 text-sm"
                      />
                    ) : (
                      <p className="text-base sm:text-lg font-medium">{userData.address}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Pincode</Label>
                    {isEditing ? (
                      <Input
                        value={userData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        placeholder="Pincode"
                        className="h-9 sm:h-10 text-sm"
                      />
                    ) : (
                      <p className="text-base sm:text-lg font-medium">{userData.pincode}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">City</Label>
                    <p className="text-base sm:text-lg font-medium">{userData.city}</p>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">State</Label>
                    <p className="text-base sm:text-lg font-medium">{userData.state}</p>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4 sm:mt-6 animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {isEditing && (
                <div className="mt-4 sm:mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="h-8 sm:h-9 text-xs sm:text-sm mr-3"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent 
          ref={deleteDialogRef}
          className="sm:max-w-[425px] p-4 sm:p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Delete Account</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full sm:w-auto h-9 text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
} 