"use client";
import { useEffect, useState } from "react";
import ProfileForm from "@/components/profile/ProfileForm";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTheme } from "next-themes";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <main className="h-screen flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-2xl h-[calc(100vh-2rem)] mx-auto">
        <div className={`
          h-full overflow-y-auto rounded-xl
          ${theme === "dark" 
            ? "bg-black/40 border border-white/10" 
            : "bg-white/40 border border-black/10"
          }
          backdrop-blur-md shadow-2xl
        `}>
          <div className="p-6">
            <ProfileForm />
          </div>
        </div>
      </div>
    </main>
  );
} 