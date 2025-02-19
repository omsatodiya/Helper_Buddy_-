"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UserData {
  id: string;
  role: string;
  createdAt: Date | string;
}

interface PaymentData {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  serviceId: string;
}

interface ServiceData {
  id: string;
  name: string;
}

interface UserStats {
  totalUsers: number;
  totalServiceProviders: number;
  totalRevenue: number;
  growthRate: number;
}

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  revenue: {
    labels: string[];
    data: number[];
  };
  userTypes: {
    labels: string[];
    data: number[];
  };
  servicePopularity: {
    labels: string[];
    data: number[];
  };
}

interface ServiceOrderData {
  id: string;
  status: string;
  items?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<{
    userGrowth: { labels: string[]; data: number[] };
    revenue: { labels: string[]; data: number[] };
    userTypes: { labels: string[]; data: number[] };
    servicePopularity: { labels: string[]; data: number[] };
  }>({
    userGrowth: { labels: [], data: [] },
    revenue: { labels: [], data: [] },
    userTypes: { labels: [], data: [] },
    servicePopularity: { labels: [], data: [] },
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore();

        // Fetch collections
        const [usersSnap, paymentsSnap, servicesSnap, serviceRequestsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "payments")),
          getDocs(collection(db, "services")),
          getDocs(collection(db, "serviceRequests")),
        ]);

        // Process users data
        const users = usersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt:
            doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        })) as UserData[];

        // Process payments data
        const payments = paymentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt:
            doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        })) as PaymentData[];

        // Calculate basic stats
        const totalUsers = users.length;
        const serviceProviders = users.filter(
          (user) => user.role === "provider"
        ).length;
        const totalRevenue = payments
          .filter((payment) => payment.status === "completed")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Calculate growth rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = users.filter(
          (user) => new Date(user.createdAt) > thirtyDaysAgo
        ).length;
        const growthRate = (newUsers / totalUsers) * 100;

        // Generate daily data for the last 30 days
        const days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split("T")[0];
        }).reverse();

        const userGrowthData = days.map((day) => {
          return users.filter((user) => {
            const userDate = new Date(user.createdAt)
              .toISOString()
              .split("T")[0];
            return userDate === day;
          }).length;
        });

        const revenueData = days.map((day) => {
          return payments
            .filter((payment) => {
              const paymentDate = new Date(payment.createdAt)
                .toISOString()
                .split("T")[0];
              return paymentDate === day && payment.status === "completed";
            })
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);
        });

        // Calculate user types distribution
        const userTypes = {
          regular: users.filter((user) => user.role === "user").length,
          provider: serviceProviders,
          admin: users.filter((user) => user.role === "admin").length,
        };

        // Update the service popularity calculation
        const serviceOrders = serviceRequestsSnap.docs
          .filter(doc => doc.data().status === "paid")
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ServiceOrderData[];

        // Create a map to store service counts
        const serviceCountMap = new Map();

        // Count services from orders
        serviceOrders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const count = serviceCountMap.get(item.name) || 0;
              serviceCountMap.set(item.name, count + 1);
            });
          }
        });

        // Convert to array and get top 5
        const serviceUsage = Array.from(serviceCountMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalUsers,
          totalServiceProviders: serviceProviders,
          totalRevenue,
          growthRate: Math.round(growthRate * 10) / 10,
        });

        setAnalyticsData({
          userGrowth: {
            labels: days.map((day) => {
              const date = new Date(day);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            data: userGrowthData,
          },
          revenue: {
            labels: days.map((day) => {
              const date = new Date(day);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            data: revenueData,
          },
          userTypes: {
            labels: ["Regular Users", "Service Providers", "Admins"],
            data: [userTypes.regular, userTypes.provider, userTypes.admin],
          },
          servicePopularity: {
            labels: serviceUsage.map(s => s.name),
            data: serviceUsage.map(s => s.count),
          },
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={{
            value: stats.growthRate,
            isPositive: stats.growthRate > 0,
          }}
          className="bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
        />
        <DashboardCard
          title="Service Providers"
          value={stats.totalServiceProviders}
          icon={Users}
          className="bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
        />
        <DashboardCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          className="bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
        />
        <DashboardCard
          title="Growth"
          value={`${stats.growthRate}%`}
          icon={TrendingUp}
          className="bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Daily User Growth</h3>
          <div className="h-[250px]">
            <Line
              data={{
                labels: analyticsData.userGrowth.labels,
                datasets: [
                  {
                    label: "New Users",
                    data: analyticsData.userGrowth.data,
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Revenue</h3>
          <div className="h-[250px]">
            <Bar
              data={{
                labels: analyticsData.revenue.labels,
                datasets: [
                  {
                    label: "Revenue (₹)",
                    data: analyticsData.revenue.data,
                    backgroundColor: "#22c55e",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* User Types Distribution */}
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <div className="h-[250px]">
            <Doughnut
              data={{
                labels: analyticsData.userTypes.labels,
                datasets: [
                  {
                    data: analyticsData.userTypes.data,
                    backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b"],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      boxWidth: 12,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Most Ordered Services */}
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Most Ordered Services</h3>
          <div className="h-[250px]">
            <Bar
              data={{
                labels: analyticsData.servicePopularity.labels,
                datasets: [
                  {
                    label: "Total Orders",
                    data: analyticsData.servicePopularity.data,
                    backgroundColor: "#8b5cf6",
                  },
                ],
              }}
              options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Orders: ${context.parsed.x}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: "Number of Orders"
                    }
                  },
                  y: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
