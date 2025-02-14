import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  price: number;
  quantity: number;
}

interface CartSummaryProps {
  items: {
    price: number;
    quantity: number;
  }[];
  isAddressSelected: boolean;
}

const CartSummary = ({ items, isAddressSelected }: CartSummaryProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
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

    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    router.push(`/payment?amount=${totalAmount}`);
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
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-white/70">GST (18%)</span>
          <span className="text-black dark:text-white">
            ₹{gst.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-white/10 pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span className="text-black dark:text-white">Total</span>
            <span className="text-black dark:text-white">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={!isAddressSelected}
        className={`w-full mt-6 py-2 px-4 rounded-lg font-medium transition-colors
          ${
            isAddressSelected
              ? "bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              : "bg-gray-300 dark:bg-white/20 text-gray-500 dark:text-white/50 cursor-not-allowed"
          }`}
      >
        Proceed to Checkout
      </button>
      <p className="text-xs text-center text-gray-500 dark:text-white/50 mt-2">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
};

export default CartSummary;
