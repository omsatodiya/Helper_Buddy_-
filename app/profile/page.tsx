"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Building2,
  Map,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import gsap from "gsap";
import AnimatedBackground from "@/components/AnimatedBackground";

type Gender = "Male" | "Female" | "Other";

interface UserProfile {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  mobile: string;
  gender: Gender;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user/${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        const formattedData = {
          ...data,
          gender: capitalizeFirstLetter(data.gender) as Gender,
        };
        setProfile(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const capitalizeFirstLetter = (str: string): Gender => {
    const capitalized =
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return capitalized as Gender;
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen py-12 px-4">
      <AnimatedBackground />
      <Card className="relative z-10 max-w-4xl mx-auto bg-white/80 backdrop-blur-md border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
              Profile
            </h1>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => router.push("/profile/edit")}
                className="h-12 px-8 bg-black hover:bg-gray-800 text-white transition-colors">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div ref={formRef} className="space-y-12">
            <div ref={contentRef}>
              <div className="space-y-8 mb-12">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <User size={20} className="text-black" />
                  <h2 className="text-xl font-semibold text-black">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <p className="text-black font-medium">
                        {profile?.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <p className="text-black font-medium">
                        {profile?.mobile || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Full Name
                    </p>
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <User className="h-5 w-5 text-gray-400" />
                      <p className="text-black font-medium">
                        {profile
                          ? `${profile.firstName} ${profile.lastName}`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <User className="h-5 w-5 text-gray-400" />
                      <p className="text-black font-medium">
                        {profile?.gender || "Not provided"}
                      </p>
                    </div>
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
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <p className="text-black font-medium">
                        {profile?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">City</p>
                      <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <p className="text-black font-medium">
                          {profile?.city || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">State</p>
                      <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <Map className="h-5 w-5 text-gray-400" />
                        <p className="text-black font-medium">
                          {profile?.state || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
