"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Tag,
  User,
  PenSquare,
  ArrowLeft,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminRoutes = [
  {
    name: "Analytics",
    description: "View detailed analytics and statistics",
    icon: TrendingUp,
    path: "/admin/analytics",
  },
  {
    name: "Users",
    description: "Manage user accounts and permissions",
    icon: Users,
    path: "/admin/users",
  },
  {
    name: "Payments",
    description: "Track and manage payment transactions",
    icon: DollarSign,
    path: "/admin/payments",
  },
  {
    name: "Referrals",
    description: "Monitor referral program activity",
    icon: ShoppingCart,
    path: "/admin/referrals",
  },
  {
    name: "Services",
    description: "Manage service listings and categories",
    icon: Tag,
    path: "/admin/services",
  },
  {
    name: "Provider Applications",
    description: "Review and approve service provider applications",
    icon: User,
    path: "/admin/provider-applications",
  },
  {
    name: "Blog Management",
    description: "Create and manage blog content",
    icon: PenSquare,
    path: "/admin/blogs",
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-black/60 dark:text-white/60">
          Welcome to the admin dashboard. Select a section to manage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          return (
            <Button
              key={route.path}
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border-black/10 dark:border-white/10"
              onClick={() => router.push(route.path)}
            >
              <div className="p-2 rounded-full bg-black/5 dark:bg-white/5">
                <Icon className="w-6 h-6 text-black dark:text-white" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="font-medium text-black dark:text-white">
                  {route.name}
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {route.description}
                </p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
