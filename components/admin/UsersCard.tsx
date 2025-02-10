'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  coins: number;
  referralCode: string;
  mobile: string;
  role: string;
  createdAt: string;
}

export function UsersCard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const db = getFirestore();
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({ 
          ...doc.data() 
        } as UserData));
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
          <CardTitle>All Users</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs bg-black/50">
              Export
            </Button>
            <Button size="sm" className="text-xs bg-white text-black">
              Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/50">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Email</th>
                <th className="p-3 text-left font-medium">Role</th>
                <th className="p-3 text-left font-medium">Coins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user, i) => (
                <tr key={i} className="bg-black/20">
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {user.email}
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      user.role === 'admin' ? "bg-white/10 text-white" : "bg-black/50 text-muted-foreground"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{user.coins || 0}</span>
                    </div>
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