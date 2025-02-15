"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PaymentButton from "@/components/PaymentButton";
import Navbar from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Shield, CreditCard, Truck, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online"
  );

  const orderId = searchParams?.get("orderId");

  useEffect(() => {
    const amountFromUrl = searchParams?.get("amount");
    if (amountFromUrl) {
      setAmount(Number(amountFromUrl));
    }
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      if (!user || !orderId) {
        toast({
          title: "Error",
          description: "Missing required information",
          variant: "destructive",
        });
        return;
      }

      // Get the order details first
      const orderRef = doc(db, "serviceRequests", orderId);
      const orderDoc = await getDoc(orderRef);
      const orderData = orderDoc.data();

      if (!orderData || !orderData.providerId) {
        toast({
          title: "Error",
          description: "Order information not found",
          variant: "destructive",
        });
        return;
      }

      // Update order status with payment information
      await updateDoc(orderRef, {
        status: "paid",
        isPaid: true,
        paymentMethod: paymentMethod,
        paymentDate: new Date(),
        updatedAt: new Date(),
        // Include provider information in payment update
        paidToProvider: orderData.providerId,
        providerName: orderData.providerName,
      });

      toast({
        title: "Success!",
        description:
          paymentMethod === "cod"
            ? "Your order has been placed with Cash on Delivery"
            : "Payment completed successfully",
      });

      router.push("/services/orders");
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

  const handleCOD = async () => {
    await handlePaymentSuccess();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 mt-24 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
                Choose Payment Method
              </h1>

              <div className="space-y-4 mb-8">
                {/* Online Payment Card */}
                <div
                  onClick={() => setPaymentMethod("online")}
                  className={`
                    cursor-pointer p-6 rounded-lg border-2 transition-all
                    ${
                      paymentMethod === "online"
                        ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <p className="font-medium text-lg">Online Payment</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pay securely with your credit/debit card
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "online" && (
                      <Check className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Cash on Delivery Card */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`
                    cursor-pointer p-6 rounded-lg border-2 transition-all
                    ${
                      paymentMethod === "cod"
                        ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Truck className="w-6 h-6" />
                      <div>
                        <p className="font-medium text-lg">Cash on Delivery</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pay when service is completed
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <Check className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              <div className="border-t border-black/10 dark:border-white/10 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-3xl font-bold">
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 flex items-start gap-3 mb-8">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-medium">Secure Transaction</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your payment and personal information are always secure
                  </p>
                </div>
              </div>

              {/* Payment Action Button */}
              {paymentMethod === "online" ? (
                <PaymentButton
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  disabled={isProcessing}
                  className="w-full py-4 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-lg transition-colors"
                />
              ) : (
                <Button
                  onClick={handleCOD}
                  disabled={isProcessing}
                  className="w-full py-4 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-lg transition-colors"
                >
                  Confirm Cash on Delivery
                </Button>
              )}

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                By proceeding, you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster />
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-black dark:border-white border-t-transparent"></div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
