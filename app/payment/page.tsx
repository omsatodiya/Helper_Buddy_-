"use client";
import { useState } from 'react';
import PaymentButton from '@/components/PaymentButton';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PaymentPage() {
  const [amount, setAmount] = useState<number>(1000);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
              Complete Your Payment
            </h1>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
              <div className="border-t border-black/10 dark:border-white/10 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-black dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-2xl font-semibold text-black dark:text-white">
                    ₹{amount}
                  </span>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <PaymentButton amount={amount} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
