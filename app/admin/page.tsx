'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Users, ShoppingCart, DollarSign, TrendingUp, Menu } from 'lucide-react';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { RecentActivityCard } from '@/components/admin/RecentActivityCard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const mockActivities = [
  {
    id: '1',
    user: 'John Doe',
    action: 'Created a new order #1234',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    user: 'Jane Smith',
    action: 'Updated their profile',
    timestamp: '5 minutes ago',
  },
  {
    id: '3',
    user: 'Mike Johnson',
    action: 'Completed payment for order #1232',
    timestamp: '10 minutes ago',
  },
  {
    id: '4',
    user: 'Sarah Wilson',
    action: 'Added new items to cart',
    timestamp: '15 minutes ago',
  },
];

export default function AdminDashboard() {
  const headerRef = useRef<HTMLDivElement>(null);

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
    <ScrollArea className="h-screen">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container px-4 py-6 space-y-8">
          {/* Welcome Section */}
          <div ref={headerRef} className="opacity-0 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, Admin!</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your application today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Users"
              value="1,234"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              index={0}
              className="sm:col-span-1"
            />
            <DashboardCard
              title="Total Orders"
              value="856"
              icon={ShoppingCart}
              trend={{ value: 8, isPositive: true }}
              index={1}
              className="sm:col-span-1"
            />
            <DashboardCard
              title="Revenue"
              value="$45,231"
              icon={DollarSign}
              trend={{ value: 15, isPositive: true }}
              index={2}
              className="sm:col-span-1"
            />
            <DashboardCard
              title="Growth"
              value="24.5%"
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
              index={3}
              className="sm:col-span-1"
            />
          </div>

          {/* Dashboard Content */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
            {/* Recent Activity */}
            <RecentActivityCard 
              activities={mockActivities} 
              className="lg:col-span-4"
            />
            
            {/* Additional Cards */}
            <Card className="lg:col-span-2 h-[400px]">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Orders
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ScrollArea>
  );
} 