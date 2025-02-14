"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PaymentButton from "@/components/PaymentButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const amountFromUrl = searchParams.get("amount");
    if (amountFromUrl) {
      setAmount(Number(amountFromUrl));
    }
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      // Clear the cart from Firebase
      const cartRef = doc(db, "carts", user.uid);
      await deleteDoc(cartRef);

      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
      });

      // Redirect to services page after successful payment and cart clearing
      router.push("/services");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 mt-24 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Payment Card */}
            <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-8 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  Complete Your Payment
                </h1>
                <CreditCard className="w-8 h-8 text-black dark:text-white" />
              </div>

              {/* Amount Input */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-lg">
                    Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="text-2xl font-semibold h-14"
                    readOnly
                  />
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-black dark:text-white">
                      Secure Payment
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="border-t border-black/10 dark:border-white/10 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-black dark:text-white">
                      Total Amount
                    </span>
                    <span className="text-3xl font-bold text-black dark:text-white">
                      ₹{amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="mt-8">
                  <PaymentButton
                    amount={amount}
                    onSuccess={handlePaymentSuccess}
                    disabled={isProcessing}
                    className="w-full py-4 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-lg transition-colors"
                  />
                  <p className="text-center text-sm text-gray-500 dark:text-white/50 mt-4">
                    By clicking above, you agree to our terms of service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster />
    </>
  );
}

// Wrap the main component with Suspense
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-black dark:border-white border-t-transparent"></div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
