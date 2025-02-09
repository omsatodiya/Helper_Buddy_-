"use client";

import { useState } from "react";
import { PaymentProps } from "../app/types/payment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentButton({ amount }: PaymentProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create order on the server
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!data.orderId) {
        throw new Error("Failed to create order");
      }

      // Load Razorpay SDK
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount * 100,
          currency: "INR",
          name: "Your Company Name",
          description: "Payment for your service",
          order_id: data.orderId,
          handler: function (response: any) {
            console.log("Payment successful:", response);
            // Handle successful payment here
          },
          prefill: {
            name: "",
            email: "",
            contact: "",
          },
          theme: {
            color: "#000000",
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      };

      script.onerror = () => {
        throw new Error("Failed to load Razorpay SDK");
      };
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
      {loading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        "Pay Now"
      )}
    </button>
  );
}
