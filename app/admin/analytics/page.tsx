"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';
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
  createdAt: string;
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

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: { labels: [], data: [] },
    revenue: { labels: [], data: [] },
    userTypes: { labels: [], data: [] },
    servicePopularity: { labels: [], data: [] }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore();
        const usersSnapshot = await getDocs(collection(db, "users"));
        const paymentsSnapshot = await getDocs(collection(db, "payments"));
        const servicesSnapshot = await getDocs(collection(db, "services"));

        const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserData[];
        const payments = paymentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PaymentData[];
        const services = servicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ServiceData[];

        // Calculate basic stats
        const totalUsers = users.length;
        const serviceProviders = users.filter((user) => user.role === "provider").length;
        const totalRevenue = payments
          .filter((payment) => payment.status === "completed")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

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

        // Calculate analytics data
        const days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const userGrowthData = days.map(day => {
          return users.filter(user => {
            const userDate = new Date(user.createdAt).toISOString().split('T')[0];
            return userDate === day;
          }).length;
        });

        const revenueData = days.map(day => {
          return payments
            .filter(payment => {
              const paymentDate = new Date(payment.createdAt).toISOString().split('T')[0];
              return paymentDate === day && payment.status === 'completed';
            })
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);
        });

        const formattedDays = days.map(day => {
          const date = new Date(day);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const userTypes = {
          regular: users.filter(user => user.role === 'user').length,
          provider: users.filter(user => user.role === 'provider').length,
          admin: users.filter(user => user.role === 'admin').length
        };

        const serviceUsage = services.map(service => ({
          name: service.name,
          count: payments.filter(p => p.serviceId === service.id).length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

        setAnalyticsData({
          userGrowth: {
            labels: formattedDays,
            data: userGrowthData
          },
          revenue: {
            labels: formattedDays,
            data: revenueData
          },
          userTypes: {
            labels: ['Regular Users', 'Service Providers', 'Admins'],
            data: [userTypes.regular, userTypes.provider, userTypes.admin]
          },
          servicePopularity: {
            labels: serviceUsage.map(s => s.name),
            data: serviceUsage.map(s => s.count)
          }
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
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
                datasets: [{
                  label: 'New Users',
                  data: analyticsData.userGrowth.data,
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
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
                datasets: [{
                  label: 'Revenue (₹)',
                  data: analyticsData.revenue.data,
                  backgroundColor: '#22c55e',
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
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
                datasets: [{
                  data: analyticsData.userTypes.data,
                  backgroundColor: [
                    '#3b82f6',
                    '#22c55e',
                    '#f59e0b'
                  ]
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 12
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Services</h3>
          <div className="h-[250px]">
            <Bar
              data={{
                labels: analyticsData.servicePopularity.labels,
                datasets: [{
                  label: 'Bookings',
                  data: analyticsData.servicePopularity.data,
                  backgroundColor: '#8b5cf6',
                }]
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 