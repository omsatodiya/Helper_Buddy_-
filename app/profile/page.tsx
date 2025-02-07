import { Metadata } from "next";
import { ProfileForm } from "@/components/ProfileForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Profile | Helper Buddy",
  description: "Manage your profile settings",
};

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-adallyn text-white tracking-wide">
            Profile Settings
          </h1>
          <p className="text-white/60 text-lg">
            Manage your personal information and preferences
          </p>
        </div>

        <ProfileForm />
      </div>
    </main>
  );
}
