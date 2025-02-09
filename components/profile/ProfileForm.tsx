"use client";
import { useState, useEffect, memo } from "react";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft } from "lucide-react";
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        }
      } catch (err) {
        setError("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (name: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));
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
            Profile Settings
          </CardTitle>
        </div>
        <p className="text-center text-muted-foreground text-sm px-4">
          Manage your account details
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Column */}
            <div className="space-y-4 lg:space-y-6">
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
            </div>

            {/* Right Column */}
            <div className="space-y-4 lg:space-y-6">
              <InputField 
                name="address" 
                label="Address"
                value={userData.address}
                onChange={(value) => handleInputChange("address", value)}
                disabled={!isEditing}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  name="city" 
                  label="City"
                  value={userData.city}
                  onChange={(value) => handleInputChange("city", value)}
                  disabled={!isEditing}
                />
                <InputField 
                  name="state" 
                  label="State"
                  value={userData.state}
                  onChange={(value) => handleInputChange("state", value)}
                  disabled={!isEditing}
                />
              </div>
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
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
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
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
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