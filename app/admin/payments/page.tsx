"use client";

import { PaymentsCard } from "@/components/admin/PaymentsCard";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";
import { getFirestore, getDocs, collection } from "firebase/firestore";

interface Payment {
  id: string;
  amount: number;
  userId: string;
  userEmail: string;
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <PaymentsCard 
        currentPage={currentPage} 
        itemsPerPage={ITEMS_PER_PAGE} 
        payments={payments}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE))}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 