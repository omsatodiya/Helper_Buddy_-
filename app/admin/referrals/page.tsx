"use client";

import { ReferralsCard } from "@/components/admin/ReferralsCard";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";
import { getFirestore, getDocs, collection } from "firebase/firestore";

interface ReferralHistory {
  referredEmail: string;
  referralDate: string;
}

interface UserReferral {
  email: string;
  coins: number;
  referralHistory?: ReferralHistory[];
}

const ITEMS_PER_PAGE = 10;

export default function ReferralsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [referrals, setReferrals] = useState<UserReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore();
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        const usersWithReferrals = usersSnapshot.docs
          .map(doc => ({ ...doc.data() } as UserReferral))
          .filter(user => user.referralHistory && user.referralHistory.length > 0)
          .sort((a, b) => {
            const aDate = a.referralHistory?.[0]?.referralDate || '';
            const bDate = b.referralHistory?.[0]?.referralDate || '';
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });
        
        setReferrals(usersWithReferrals);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <ReferralsCard 
        currentPage={currentPage} 
        itemsPerPage={ITEMS_PER_PAGE} 
        referrals={referrals}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(referrals.length / ITEMS_PER_PAGE))}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 