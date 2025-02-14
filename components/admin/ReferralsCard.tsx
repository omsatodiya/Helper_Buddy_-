'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { columnStyles } from '@/components/shared/TableLayout';

interface ReferralRecord {
  referredEmail: string;
  referralDate: string;
}

interface UserReferral {
  email: string;
  coins: number;
  referralHistory?: ReferralRecord[];
  referredEmails?: string[];
}

interface ReferralsCardProps {
  currentPage: number;
  itemsPerPage: number;
  referrals: UserReferral[];
}

export function ReferralsCard({ currentPage, itemsPerPage, referrals }: ReferralsCardProps) {
  const [allUsers, setAllUsers] = useState<Record<string, UserReferral>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const db = getFirestore();
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        const usersMap: Record<string, UserReferral> = {};
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data() as UserReferral;
          usersMap[userData.email] = userData;
        });
        
        setAllUsers(usersMap);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Get paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReferrals = referrals.slice(startIndex, endIndex);

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
        <div className="flex flex-col gap-4">
          <CardTitle className="text-black dark:text-white">Referral History</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full table-fixed text-sm text-black dark:text-white">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className={columnStyles.name}>Referrer</th>
                <th className={columnStyles.email}>Referred User</th>
                <th className={columnStyles.role}>Referrer Coins</th>
                <th className={columnStyles.coins}>Referred Coins</th>
                <th className={columnStyles.actions}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {paginatedReferrals.map((user, i) => (
                user.referralHistory?.map((referral, j) => (
                  <tr key={`${i}-${j}`} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-4 truncate text-black/60 dark:text-white/60">
                      {user.email}
                    </td>
                    <td className="p-4 truncate text-black/60 dark:text-white/60">
                      {referral.referredEmail}
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <Coins className="h-4 w-4" />
                        <span>{user.coins.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <Coins className="h-4 w-4" />
                        <span>{allUsers[referral.referredEmail]?.coins.toLocaleString() || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 text-black/60 dark:text-white/60">
                      {new Date(referral.referralDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 