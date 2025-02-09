import ProfileForm from "@/components/profile/ProfileForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="relative z-10">
        <ProfileForm />
      </div>
    </div>
  );
} 