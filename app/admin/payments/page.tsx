"use client";

import { PaymentsCard } from "@/components/admin/PaymentsCard";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";
import { getFirestore, getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Payment {
  id: string;
  amount: number;
  userId: string;
  userEmail: string;
  status: 'completed' | 'pending' | 'refunded' | 'refund-pending';
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async (payment: Payment) => {
    setSelectedPayment(payment);
    setShowRefundDialog(true);
  };

  const confirmRefund = async () => {
    if (!selectedPayment) return;

    try {
      const db = getFirestore();
      const paymentRef = doc(db, 'payments', selectedPayment.id);
      
      await updateDoc(paymentRef, {
        status: 'refund-pending',
        refundRequestedAt: new Date().toISOString(),
      });

      // Update local state
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === selectedPayment.id 
            ? { ...payment, status: 'refund-pending' } 
            : payment
        )
      );

      toast({
        title: "Refund Initiated",
        description: `Refund for payment ${selectedPayment.id} has been initiated.`,
      });
    } catch (error) {
      console.error('Error initiating refund:', error);
      toast({
        title: "Error",
        description: "Failed to initiate refund",
        variant: "destructive",
      });
    } finally {
      setShowRefundDialog(false);
      setSelectedPayment(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
        <div className="divide-y divide-black/10 dark:divide-white/10">
          {payments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((payment) => (
            <div key={payment.id} className="p-4 bg-white dark:bg-black hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black dark:text-white">
                    Payment ID: {payment.id}
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    User: {payment.userEmail}
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Amount: ₹{payment.amount}
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Date: {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : ''}
                    ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : ''}
                    ${payment.status === 'refunded' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' : ''}
                    ${payment.status === 'refund-pending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : ''}
                  `}>
                    {payment.status.toUpperCase()}
                  </span>
                  {payment.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefund(payment)}
                      className="border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/50"
                    >
                      Refund
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE))}
        onPageChange={setCurrentPage}
      />

      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to initiate a refund for payment {selectedPayment?.id}?
              Amount to be refunded: ₹{selectedPayment?.amount}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRefund}>
              Confirm Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 