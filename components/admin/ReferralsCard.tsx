'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export function ReferralsCard() {
  const [referrals, setReferrals] = useState<UserReferral[]>([]);
  const [allUsers, setAllUsers] = useState<Record<string, UserReferral>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const db = getFirestore();
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        const usersMap: Record<string, UserReferral> = {};
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data() as UserReferral;
          usersMap[userData.email] = userData;
        });
        
        const usersWithReferrals = usersSnapshot.docs
          .map(doc => ({ ...doc.data() } as UserReferral))
          .filter(user => user.referralHistory && user.referralHistory.length > 0);
        
        setAllUsers(usersMap);
        setReferrals(usersWithReferrals);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
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
        <div className="flex flex-col gap-4">
          <CardTitle className="text-black dark:text-white">Referral History</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full text-sm text-black dark:text-white">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="p-3 text-left font-medium">Referrer</th>
                <th className="p-3 text-left font-medium">Referrer Coins</th>
                <th className="p-3 text-left font-medium">Referred User</th>
                <th className="p-3 text-left font-medium">Referred Coins</th>
                <th className="p-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {referrals.map((user, i) => (
                user.referralHistory?.map((referral, j) => (
                  <tr key={`${i}-${j}`} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-3">
                      <span className="font-medium">{user.email}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                        <Coins className="h-3 w-3" />
                        <span>{user.coins}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{referral.referredEmail}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                        <Coins className="h-3 w-3" />
                        <span>{allUsers[referral.referredEmail]?.coins || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-black/60 dark:text-white/60">
                        {new Date(referral.referralDate).toLocaleDateString()}
                      </span>
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