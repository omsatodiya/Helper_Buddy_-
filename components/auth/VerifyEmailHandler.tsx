"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function VerifyEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
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
        // First check what type of action this code is for
        const actionInfo = await checkActionCode(auth, oobCode);
        
        if (actionInfo.operation === 'VERIFY_EMAIL') {
          await applyActionCode(auth, oobCode);
          setSuccess(true);
        }
        // Don't handle password reset here - let the form handle it
      } catch (err) {
        setError("This verification link is invalid or has expired");
      } finally {
        setVerifying(false);
      }
    };

    if (mode === 'verifyEmail') {
      verifyEmail();
    } else {
      setVerifying(false);
    }
  }, [oobCode, mode]);

  // Show password reset form if mode is resetPassword
  if (mode === 'resetPassword') {
    return <ResetPasswordForm />;
  }

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

  // Rest of the email verification UI remains the same...
  // ... (existing success and error states for email verification)
} 