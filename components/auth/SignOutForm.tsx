"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignOutForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Card className="max-w-md w-full mx-auto border-0 shadow-lg">
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="text-center text-2xl font-bold">
          Sign Out
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm">
          Are you sure you want to sign out?
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 h-11"
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing out...
                </div>
              ) : (
                "Sign out"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 