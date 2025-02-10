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
    <Card className="col-span-full bg-black/20">
      <CardHeader className="p-4 border-b border-white/10">
        <div className="flex flex-col gap-4">
          <CardTitle>Referral History</CardTitle>
          <Button variant="outline" size="sm" className="text-xs bg-black/50 w-full sm:w-auto">
            Export History
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/50">
                <th className="p-3 text-left font-medium">Referrer</th>
                <th className="p-3 text-left font-medium">Coins</th>
                <th className="p-3 text-left font-medium">R.Coins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {referrals.map((user, i) => (
                user.referralHistory?.map((referral, j) => (
                  <tr key={`${i}-${j}`} className="bg-black/20">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(referral.referralDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{user.coins}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{allUsers[referral.referredEmail]?.coins || 0}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {referral.referredEmail}
                        </span>
                      </div>
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