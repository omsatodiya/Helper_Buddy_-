"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PaymentButton from "@/components/PaymentButton";
import Navbar from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Shield, CreditCard, Truck, Check, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/firebase";
import { doc, updateDoc, getDoc, collection, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { getFirestore } from "firebase/firestore";

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
  const [userCoins, setUserCoins] = useState(0);
  const [appliedCoins, setAppliedCoins] = useState(0);
  const [isApplyingCoins, setIsApplyingCoins] = useState(false);

  const orderId = searchParams?.get("orderId");

  useEffect(() => {
    const amountFromUrl = searchParams?.get("amount");
    if (amountFromUrl) {
      setAmount(Number(amountFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserCoins(userDoc.data().coins || 0);
        }
      } catch (error) {
        console.error("Error fetching user coins:", error);
      }
    };

    fetchUserCoins();
  }, [user]);

  const handleApplyCoins = () => {
    if (!user) return;
    
    setIsApplyingCoins(true);
    const coinsToApply = Math.min(userCoins, amount);
    setAppliedCoins(coinsToApply);
  };

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

      const db = getFirestore();

      // Update user's coins if applied
      if (appliedCoins > 0) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          coins: userCoins - appliedCoins
        });
      }

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

      const finalAmount = amount - appliedCoins;

      // Create payment record
      const paymentRef = doc(collection(db, "payments"));
      await setDoc(paymentRef, {
        id: paymentRef.id,
        amount: amount,
        coinsUsed: appliedCoins,
        finalAmount: finalAmount,
        userId: user.uid,
        userEmail: user.email,
        orderId: orderId,
        status: "completed",
        paymentMethod: paymentMethod,
        createdAt: new Date(),
        providerId: orderData.providerId,
        providerName: orderData.providerName,
      });

      // Update order status
      await updateDoc(orderRef, {
        status: "paid",
        isPaid: true,
        paymentMethod: paymentMethod,
        paymentDate: new Date(),
        updatedAt: new Date(),
        paymentId: paymentRef.id,
        paidToProvider: orderData.providerId,
        providerName: orderData.providerName,
        coinsUsed: appliedCoins,
        finalAmount: finalAmount,
      });

      toast({
        title: "Success!",
        description:
          paymentMethod === "cod"
            ? "Your order has been placed with Cash on Delivery"
            : "Payment completed successfully",
      });

      // Add a small delay before redirecting
      setTimeout(() => {
        router.push("/services/orders");
      }, 1500);

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
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">₹{amount.toLocaleString("en-IN")}</span>
                  </div>
                  {appliedCoins > 0 && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                      <span>Coin Discount</span>
                      <span>-₹{appliedCoins.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold pt-2">
                    <span>Total Amount</span>
                    <span>₹{(amount - appliedCoins).toLocaleString("en-IN")}</span>
                  </div>
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
                  amount={amount - appliedCoins}
                  originalAmount={amount}
                  coinsApplied={appliedCoins}
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

              {userCoins > 0 && (
                <div className="border-t border-black/10 dark:border-white/10 pt-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Available Coins</span>
                    </div>
                    <span className="text-lg font-semibold">{userCoins}</span>
                  </div>
                  
                  {!isApplyingCoins ? (
                    <Button
                      onClick={handleApplyCoins}
                      variant="outline"
                      className="w-full"
                    >
                      Apply {Math.min(userCoins, amount)} Coins
                    </Button>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 dark:text-green-300">
                          Coins Applied
                        </span>
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          -{appliedCoins} ₹
                        </span>
                      </div>
                    </div>
                  )}
                </div>
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
