"use client";

import { Menu, TrendingUp, Users, DollarSign, ShoppingCart, Tag, User, PenSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const navigationItems = [
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Payments", path: "/admin/payments", icon: DollarSign },
  { name: "Referrals", path: "/admin/referrals", icon: ShoppingCart },
  { name: "Services", path: "/admin/services", icon: Tag },
  { name: "Provider Applications", path: "/admin/provider-applications", icon: User },
  { name: "Blog Management", path: "/admin/blogs", icon: PenSquare },
];

export function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="p-6 pb-2 border-b">
              <div className="flex flex-col space-y-4">
                <SheetTitle>Navigation Menu</SheetTitle>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={() => {
                    router.push("/admin/analytics");
                    setIsMenuOpen(false);
                  }}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </SheetHeader>
            <div className="px-6 py-4 flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => {
                      router.push(item.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white ml-4">
          Admin Dashboard
        </h2>
      </div>
    </header>
  );
} 