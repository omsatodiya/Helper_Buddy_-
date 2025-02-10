'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  userId: string;
  userEmail: string;
  status: string;
  createdAt: string;
}

export function PaymentsCard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const db = getFirestore();
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        const paymentsData = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Payment));

        setPayments(paymentsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full border border-black/10 dark:border-white/10">
      <CardHeader className="p-4 border-b border-black/10 dark:border-white/10">
        <CardTitle className="text-black dark:text-white">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full table-fixed text-sm text-black dark:text-white">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="p-3 text-left font-medium w-[45%]">User</th>
                <th className="p-3 text-left font-medium w-[20%]">Amount</th>
                <th className="p-3 text-left font-medium w-[15%]">Status</th>
                <th className="p-3 text-left font-medium w-[20%]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="p-3 truncate">
                    <span className="font-medium">{payment.userEmail}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>{payment.amount}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      payment.status === 'completed' 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-black/60 dark:text-white/60">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 