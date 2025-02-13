"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReferralsCard } from "@/components/admin/ReferralsCard";
import { UsersCard } from "@/components/admin/UsersCard";
import { PaymentsCard } from "@/components/admin/PaymentsCard";
import { cn } from "@/lib/utils";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceModal from "@/components/services/serviceModal";
import { Service } from "@/types/service";

interface UserStats {
  totalUsers: number;
  totalServiceProviders: number;
  totalRevenue: number;
  growthRate: number;
}

export default function AdminDashboard() {
  const headerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeTable, setActiveTable] = useState("users"); // users, payments, referrals, services
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.fromTo(
      header,
      { opacity: 0, y: -50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }
    );
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = getFirestore();
        const usersSnapshot = await getDocs(collection(db, "users"));
        const paymentsSnapshot = await getDocs(collection(db, "payments"));

        const users = usersSnapshot.docs.map((doc) => doc.data());
        const payments = paymentsSnapshot.docs.map((doc) => doc.data());

        const totalUsers = users.length;
        const serviceProviders = users.filter(
          (user) => user.role === "service_provider"
        ).length;

        // Calculate total revenue from completed payments
        const totalRevenue = payments
          .filter((payment) => payment.status === "completed")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Calculate growth rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = users.filter(
          (user) => new Date(user.createdAt) > thirtyDaysAgo
        );
        const growthRate = (recentUsers.length / totalUsers) * 100;

        setStats({
          totalUsers,
          totalServiceProviders: serviceProviders,
          totalRevenue,
          growthRate: Math.round(growthRate * 10) / 10,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const fetchServices = async () => {
    try {
      const db = getFirestore();
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const servicesData = servicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const renderTable = () => {
    switch (activeTable) {
      case "payments":
        return <PaymentsCard />;
      case "referrals":
        return <ReferralsCard />;
      case "services":
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Services Management
              </h2>
              <Button
                onClick={() => router.push("/services/add")}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Add New Service
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {services.map((service: Service) => (
                <ServiceCard
                  key={service.id}
                  title={service.name}
                  description={service.description}
                  price={service.price}
                  imageUrl={
                    typeof service.images?.[0] === "string"
                      ? service.images[0]
                      : service.images?.[0]?.url || "/placeholder-image.jpg"
                  }
                  rating={service.rating || 0}
                  totalRatings={service.reviews?.length || 0}
                  onAddToCart={() => {}}
                  onBuyNow={() => {}}
                  onClick={() => {
                    setSelectedService(service);
                    setIsServiceModalOpen(true);
                  }}
                />
              ))}
            </div>
            {selectedService && (
              <ServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => {
                  setIsServiceModalOpen(false);
                  setSelectedService(null);
                }}
                service={selectedService}
                isAdminView={true}
                onServiceDeleted={() => {
                  fetchServices();
                  setIsServiceModalOpen(false);
                  setSelectedService(null);
                }}
                onServiceUpdated={(updatedService) => {
                  fetchServices();
                  setSelectedService(updatedService);
                }}
              />
            )}
          </div>
        );
      default:
        return <UsersCard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Admin Dashboard
          </h2>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            trend={{
              value: stats.growthRate,
              isPositive: stats.growthRate > 0,
            }}
            className="bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow dark:border dark:border-gray-800"
          />
          <DashboardCard
            title="Service Providers"
            value={stats.totalServiceProviders}
            icon={Users}
            className="bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow dark:border dark:border-gray-800"
          />
          <DashboardCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            className="bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow dark:border dark:border-gray-800"
          />
          <DashboardCard
            title="Growth"
            value={`${stats.growthRate}%`}
            icon={TrendingUp}
            className="bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow dark:border dark:border-gray-800"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm dark:border dark:border-gray-800">
          <RadioGroup
            defaultValue="users"
            value={activeTable}
            onValueChange={setActiveTable}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="users"
                id="users"
                className="dark:border-gray-700"
              />
              <Label
                htmlFor="users"
                className="cursor-pointer dark:text-gray-200"
              >
                All Users
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="payments"
                id="payments"
                className="dark:border-gray-700"
              />
              <Label
                htmlFor="payments"
                className="cursor-pointer dark:text-gray-200"
              >
                Recent Payments
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="referrals"
                id="referrals"
                className="dark:border-gray-700"
              />
              <Label
                htmlFor="referrals"
                className="cursor-pointer dark:text-gray-200"
              >
                Referral History
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="services"
                id="services"
                className="dark:border-gray-700"
              />
              <Label
                htmlFor="services"
                className="cursor-pointer dark:text-gray-200"
              >
                Services
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTable === "services" ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 dark:border dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Services Management
                </h2>
                <Button
                  onClick={() => router.push("/services/add")}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                >
                  Add New Service
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {services.map((service: Service) => (
                  <ServiceCard
                    key={service.id}
                    title={service.name}
                    description={service.description}
                    price={service.price}
                    imageUrl={
                      typeof service.images?.[0] === "string"
                        ? service.images[0]
                        : service.images?.[0]?.url || "/placeholder-image.jpg"
                    }
                    rating={service.rating || 0}
                    totalRatings={service.reviews?.length || 0}
                    onAddToCart={() => {}}
                    onBuyNow={() => {}}
                    onClick={() => {
                      setSelectedService(service);
                      setIsServiceModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:border dark:border-gray-800">
              {renderTable()}
            </div>
          )}
        </div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          isAdminView={true}
          onServiceDeleted={() => {
            fetchServices();
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
          onServiceUpdated={(updatedService) => {
            fetchServices();
            setSelectedService(updatedService);
          }}
        />
      )}
    </div>
  );
}
