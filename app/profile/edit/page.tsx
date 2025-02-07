"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, User, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import gsap from "gsap";

interface UserProfile {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  mobile: string;
  gender: string;
}

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    mobile: "",
    gender: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session.user?.id) {
      fetchProfile();
    }
  }, [status, session]);

  useEffect(() => {
    if (!isLoading) {
      // Animate header
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      // Animate form sections with stagger
      if (contentRef.current?.children) {
        gsap.from(Array.from(contentRef.current.children), {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
        });
      }
    }
  }, [isLoading]);

  const animateFormSave = () => {
    return gsap.to(formRef.current, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    });
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user/${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch (error) {
      setError("Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    // Play save animation
    await animateFormSave();

    try {
      const res = await fetch(`/api/user/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Animate out before navigation
      await gsap.to(formRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
      });

      router.push("/profile");
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/${session?.user?.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      // Sign out the user after successful deletion
      await signOut({ redirect: false });
      
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted",
      });

      // Animate out before navigation
      await gsap.to(formRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <Card className="max-w-4xl mx-auto border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-8">
          <div
            ref={headerRef}
            className="flex items-center gap-6 mb-12 border-b border-gray-100 pb-6">
            <button
              onClick={() => router.back()}
              className="text-black hover:text-gray-600 transition-all duration-200 hover:scale-110">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-black tracking-tight">
              Edit Profile
            </h1>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-12">
            <div ref={contentRef}>
              <div className="space-y-8 mb-12">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <User size={20} className="text-black" />
                  <h2 className="text-xl font-semibold text-black">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="h-12 border-gray-200 focus:ring-black focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="h-12 border-gray-200 focus:ring-black focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Mobile
                    </label>
                    <Input
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mobile: e.target.value,
                        }))
                      }
                      className="h-12 border-gray-200 focus:ring-black focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, gender: value }))
                      }>
                      <SelectTrigger className="h-12 border-gray-200 focus:ring-black focus:border-black">
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

              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <MapPin size={20} className="text-black" />
                  <h2 className="text-xl font-semibold text-black">
                    Address Information
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="h-12 border-gray-200 focus:ring-black focus:border-black transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        City
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="h-12 border-gray-200 focus:ring-black focus:border-black transition-colors"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        State
                      </label>
                      <Input
                        value={formData.state}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        className="h-12 border-gray-200 focus:ring-black focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-100">
              <Button
                type="submit"
                className="h-12 px-8 bg-black hover:bg-gray-800 text-white transition-colors"
                disabled={isSaving || isLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
                className="h-12 px-8 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
