"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function VerifyEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode) {
        setError("Invalid verification link");
        setVerifying(false);
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        setSuccess(true);
      } catch (err) {
        setError("This verification link is invalid or has expired");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [oobCode]);

  if (verifying) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Verifying your email...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Verified!</CardTitle>
          <CardDescription className="text-center">
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              You can now access all features of your account
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push("/")} 
            className="w-full"
          >
            Continue to Homepage
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Verification Failed</CardTitle>
        <CardDescription className="text-center">
          We couldn't verify your email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          onClick={() => router.push("/")}
          className="w-full"
        >
          Return to Homepage
        </Button>
      </CardContent>
    </Card>
  );
} 