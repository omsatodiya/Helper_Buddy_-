"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProfileData {
  name: string;
  phone: string;
  address: string;
  bio: string;
  profession: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
}

export function ProfileForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    phone: "",
    address: "",
    bio: "",
    profession: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.email) return;
      
      setIsLoading(true);
      try {
        const response = await fetch("/api/user");
        if (!response.ok) throw new Error("Failed to fetch profile");
        
        const data = await response.json();
        setProfileData({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
          profession: data.profession || "",
          socialLinks: {
            facebook: data.socialLinks?.facebook || "",
            twitter: data.socialLinks?.twitter || "",
            linkedin: data.socialLinks?.linkedin || "",
            instagram: data.socialLinks?.instagram || "",
          },
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.email, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70 mb-2 block">Full Name</label>
            <Input
              value={profileData.name}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-2 block">Phone</label>
            <Input
              value={profileData.phone}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-2 block">Address</label>
            <Input
              value={profileData.address}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter your address"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-2 block">Profession</label>
            <Input
              value={profileData.profession}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, profession: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter your profession"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-2 block">Bio</label>
            <Textarea
              value={profileData.bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProfileData((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Facebook</label>
                <Input
                  value={profileData.socialLinks.facebook}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      socialLinks: {
                        ...prev.socialLinks,
                        facebook: e.target.value,
                      },
                    }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Facebook profile URL"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Twitter</label>
                <Input
                  value={profileData.socialLinks.twitter}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      socialLinks: {
                        ...prev.socialLinks,
                        twitter: e.target.value,
                      },
                    }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Twitter profile URL"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">LinkedIn</label>
                <Input
                  value={profileData.socialLinks.linkedin}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      socialLinks: {
                        ...prev.socialLinks,
                        linkedin: e.target.value,
                      },
                    }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="LinkedIn profile URL"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Instagram</label>
                <Input
                  value={profileData.socialLinks.instagram}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      socialLinks: {
                        ...prev.socialLinks,
                        instagram: e.target.value,
                      },
                    }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Instagram profile URL"
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-white hover:bg-white/90 text-black"
          disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Card>
  );
}
