"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { IndianRupee, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentButtonProps {
  amount: number;  // This is now the final amount after coin discount
  originalAmount?: number; // Optional: original amount before discount
  coinsApplied?: number; // Optional: number of coins applied
  onSuccess: () => void;
  disabled?: boolean;
  className?: string;
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

const PaymentButton = ({
  amount,
  originalAmount,
  coinsApplied = 0,
  onSuccess,
  disabled,
  className,
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      return;
    }

    // Ensure amount is valid (can be 0 if fully paid by coins)
    if (amount < 0) {
      toast({
        title: "Error",
        description: "Invalid payment amount",
        variant: "destructive",
      });
      return;
    }

    // If amount is 0 (fully paid by coins), skip Razorpay and call onSuccess
    if (amount === 0) {
      onSuccess();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            originalAmount: originalAmount || amount,
            coinsApplied: coinsApplied
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();

      if (!data.orderId) {
        throw new Error("Failed to create order - No order ID received");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "Dudh.com",
        description: coinsApplied > 0 
          ? `Service Payment (${coinsApplied} coins applied)`
          : "Service Payment",
        order_id: data.orderId,
        handler: function (response: any) {
          verifyPayment(response);
        },
        prefill: {
          email: user.email || "",
          contact: user.phoneNumber || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      const verificationResponse = await fetch("/api/razorpay", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error("Payment verification failed");
      }

      // Payment verified successfully
      onSuccess();
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Error",
        description: "Payment verification failed. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={`w-full sm:w-auto ${className || ""}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <IndianRupee className="mr-2 h-4 w-4" />
          Pay ₹{amount}
        </>
      )}
    </Button>
  );
};

export default PaymentButton;
