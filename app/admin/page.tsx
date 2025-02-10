'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Users, ShoppingCart, DollarSign, TrendingUp, Menu, X } from 'lucide-react';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReferralsCard } from '@/components/admin/ReferralsCard';
import { UsersCard } from '@/components/admin/UsersCard';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    
    gsap.fromTo(header,
      { opacity: 0, y: -50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black">
        <div className="flex h-14 items-center px-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="ml-4 text-lg font-semibold">Admin Dashboard</h2>
        </div>
      </header>

      <div className="flex-1">
        {/* Main Content */}
        <main className="p-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-1 xs:grid-cols-2">
            <DashboardCard
              title="Total Users"
              value="1,234"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              className="bg-black/20"
            />
            <DashboardCard
              title="Growth"
              value="24.5%"
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
              className="bg-black/20"
            />
          </div>

          {/* Users and Referrals */}
          <div className="space-y-4">
            <UsersCard />
            <ReferralsCard />
          </div>
        </main>
      </div>
    </div>
  );
} 