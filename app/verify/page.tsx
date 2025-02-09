"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { applyActionCode } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function VerifyEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');
      
      if (!oobCode) {
        router.push('/');
        return;
      }

      try {
        // Apply the verification code
        await applyActionCode(auth, oobCode);
        
        // Get the current user
        const user = auth.currentUser;
        if (!user) throw new Error("No user found");

        // Get stored form data
        const storedData = localStorage.getItem('signupFormData');
        if (storedData) {
          const formData = JSON.parse(storedData);
          const db = getFirestore();
          
          // Check if user document exists
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (!userDoc.exists()) {
            // Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
              ...formData,
              email: user.email,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            
            // Clear stored data
            localStorage.removeItem('signupFormData');
          }
        }

        setStatus('success');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="container relative flex items-center justify-center min-h-screen py-8">
        <Card className="max-w-md w-full mx-auto border-0 shadow-xl bg-background/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
          <CardContent className="pt-6">
            {status === 'verifying' && (
              <p className="text-center text-muted-foreground">
                Verifying your email...
              </p>
            )}
            {status === 'success' && (
              <p className="text-center text-green-600">
                Email verified successfully! Redirecting...
              </p>
            )}
            {status === 'error' && (
              <p className="text-center text-red-600">
                Failed to verify email. Please try again.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 