"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { IndianRupee, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentButtonProps {
  amount: number;
}

export default function PaymentButton({ amount }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!user?.email) {
      alert('Please login to make a payment');
      return;
    }

    setLoading(true);
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // amount in paisa
        currency: 'INR',
        name: 'Helper Buddy',
        description: 'Add Coins',
        handler: async function (response: any) {
          const paymentData = {
            userId: user.uid,
            userEmail: user.email,
            amount: amount,
            status: 'completed',
            createdAt: new Date().toISOString(),
            paymentId: response.razorpay_payment_id
          };

          await addDoc(collection(db, 'payments'), paymentData);
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#000000',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full sm:w-auto"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <IndianRupee className="mr-2 h-4 w-4" />
          Pay ₹{amount}
        </>
      )}
    </Button>
  );
}
