"use client";
import { useState, useEffect, memo } from "react";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Coins, Copy, Check, LayoutDashboard } from "lucide-react";
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
import { INDIAN_STATES } from "@/lib/constants/states";
import { getCityFromPincode } from "@/lib/utils/pincode";

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

export default function ProfileForm() {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = async (name: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));

    // Handle pincode auto-fill
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

  return (
    <Card className="w-[95%] max-w-4xl mx-auto border-0 shadow-xl bg-background/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
      <CardHeader className="space-y-3 pb-6 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 mr-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Button>
          <div className="flex-1 text-center pr-8">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Profile Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account details
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Coins and Referral Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Coins</Label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-background">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span>{userData.coins}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Referral Code</Label>
                <div className="flex items-center justify-between h-10 px-3 rounded-md border bg-background">
                  <code className="font-mono">{userData.referralCode}</code>
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
                      <span className="ml-2 text-sm">{copyStatus}</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    name="firstName" 
                    label="First Name"
                    value={userData.firstName}
                    onChange={(value) => handleInputChange("firstName", value)}
                    disabled={!isEditing}
                  />
                  <InputField 
                    name="lastName" 
                    label="Last Name"
                    value={userData.lastName}
                    onChange={(value) => handleInputChange("lastName", value)}
                    disabled={!isEditing}
                  />
                </div>
                <InputField 
                  name="email" 
                  label="Email" 
                  type="email"
                  value={userData.email}
                  onChange={(value) => handleInputChange("email", value)}
                  disabled={true}
                />
                <InputField 
                  name="mobile" 
                  label="Mobile Number" 
                  type="tel"
                  value={userData.mobile}
                  onChange={(value) => handleInputChange("mobile", value)}
                  disabled={!isEditing}
                />
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <Select
                    disabled={!isEditing}
                    value={userData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}>
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

              {/* Address Information */}
              <div className="space-y-4">
                <InputField 
                  name="address" 
                  label="Address"
                  value={userData.address}
                  onChange={(value) => handleInputChange("address", value)}
                  disabled={!isEditing}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    name="pincode" 
                    label="Pincode"
                    value={userData.pincode}
                    onChange={(value) => handleInputChange("pincode", value)}
                    disabled={!isEditing}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                    <Select
                      disabled={!isEditing}
                      value={userData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    name="city" 
                    label="City"
                    value={userData.city}
                    onChange={(value) => handleInputChange("city", value)}
                    disabled={true}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Select
                      disabled={true}
                      value={userData.state}
                      onValueChange={(value) => handleInputChange("state", value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-11"
                  onClick={handleUpdate}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Button
                    type="button"
                    className="flex-1 h-11 bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                    onClick={() => router.push('/admin')}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  type="button"
                  className="flex-1 h-11"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
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
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1 h-11"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              className="flex-1"
              disabled={loading}
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
    </Card>
  );
} 