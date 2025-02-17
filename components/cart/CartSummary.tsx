import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { auth } from "@/lib/firebase/firebase";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  serviceProvider?: string;
  thresholdTime?: string;
}

interface CartSummaryProps {
  items: CartItem[];
  isAddressSelected: boolean;
  hasDateTime: boolean;
  onNotifyProviders: (data: {
    items: CartItem[];
    thresholdTime: string;
    totalAmount: number;
  }) => Promise<void>;
  isSendingEmails: boolean;
}

const CartSummary = ({
  items,
  isAddressSelected,
  hasDateTime,
  onNotifyProviders,
  isSendingEmails,
}: CartSummaryProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

  const handleCheckout = () => {
    if (!isAddressSelected) {
      toast({
        title: "Select Address",
        description: "Please select a delivery address before checkout",
        variant: "destructive",
      });
      return;
    }

    router.push(`/payment?amount=${total}`);
  };

  const handleNotifyProviders = async () => {
    if (!isAddressSelected || !hasDateTime) {
      toast({
        title: "Required Fields",
        description: "Please select address and date/time before proceeding",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const serviceRequestData = {
        items: items,
        thresholdTime: items[0]?.thresholdTime || "120",
        totalAmount: total,
      };

      await onNotifyProviders(serviceRequestData);

      toast({
        title: "Request Sent",
        description: "Service providers have been notified of your request",
      });

      router.push("/services/orders");
    } catch (error) {
      console.error("Error creating service request:", error);
      toast({
        title: "Error",
        description: "Failed to send service request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
        Order Summary
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-white/70">Subtotal</span>
          <span className="text-black dark:text-white">
            ₹
            {subtotal.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-white/70">GST (18%)</span>
          <span className="text-black dark:text-white">
            ₹
            {gst.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-white/10 pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span className="text-black dark:text-white">Total</span>
            <span className="text-black dark:text-white">
              ₹
              {total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-6"
        disabled={!isAddressSelected || !hasDateTime || isSendingEmails}
        onClick={handleNotifyProviders}
      >
        {isSendingEmails ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Finding Service Partners...
          </div>
        ) : !isAddressSelected ? (
          "Please Select Address"
        ) : !hasDateTime ? (
          "Please Select Date & Time"
        ) : (
          "Find Service Partners"
        )}
      </Button>
      {!isAddressSelected && (
        <p className="text-sm text-red-500 mt-2">
          Please select a delivery address to continue
        </p>
      )}
      <p className="text-xs text-center text-gray-500 dark:text-white/50 mt-2">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
};

export default CartSummary;
