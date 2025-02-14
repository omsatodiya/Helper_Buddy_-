"use client";

import { ReferralsCard } from "@/components/admin/ReferralsCard";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { getFirestore, getDocs, collection, doc, getDoc, setDoc } from "firebase/firestore";

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
  const [referralBonus, setReferralBonus] = useState<number>(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore();
        
        // Fetch referrals
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

        // Fetch referral bonus setting
        const settingsDoc = await getDoc(doc(db, 'admin_settings', 'referral'));
        if (settingsDoc.exists()) {
          setReferralBonus(settingsDoc.data().bonusAmount);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveBonus = async () => {
    setSaving(true);
    try {
      const db = getFirestore();
      await setDoc(doc(db, 'admin_settings', 'referral'), {
        bonusAmount: Number(referralBonus),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving referral bonus:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <Card className="col-span-full border border-black/10 dark:border-white/10">
        <CardHeader className="p-4 border-b border-black/10 dark:border-white/10">
          <CardTitle className="text-black dark:text-white">Referral Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referralBonus">Referral Bonus Amount (Coins)</Label>
            <div className="flex gap-2">
              <Input
                id="referralBonus"
                type="number"
                value={referralBonus}
                onChange={(e) => setReferralBonus(Number(e.target.value))}
                min={0}
                className="max-w-[200px]"
              />
              <Button 
                onClick={handleSaveBonus}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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