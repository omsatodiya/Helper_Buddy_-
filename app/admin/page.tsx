"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  XCircle,
  PlusCircle,
  User,
  Clock,
  Tag,
  PenSquare,
  Menu,
} from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReferralsCard } from "@/components/admin/ReferralsCard";
import { UsersCard } from "@/components/admin/UsersCard";
import { PaymentsCard } from "@/components/admin/PaymentsCard";
import { cn } from "@/lib/utils";
import { getFirestore, getDocs, collection, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceModal from "@/components/services/serviceModal";
import { Service } from "@/types/service";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { BlogModel } from "@/app/blog/BlogModel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import emailjs from '@emailjs/browser';
import { Pagination } from "@/components/ui/pagination";
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

// Initialize EmailJS with your public key
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);

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

interface BlogPost {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
  readTime: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

interface Payment {
  id: string;
  amount: number;
  userId: string;
  userEmail: string;
  status: string;
  createdAt: string;
}

interface UserReferral {
  email: string;
  coins: number;
  referralHistory?: {
    referredEmail: string;
    referralDate: string;
  }[];
}

interface ProviderApplication {
  userId: string;
  userName: string;
  email: string;
  photo: string;
  services: string[];
  servicePincodes: { pincode: string }[];
  applicationDate: string;
  status: string;
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

interface UserAnalytics {
  id: string;
  createdAt: string;
  role: string;
}

interface PaymentAnalytics {
  id: string;
  createdAt: string;
  status: string;
  amount: number;
  serviceId: string;
}

interface ServiceAnalytics {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const headerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeTable, setActiveTable] = useState("users"); // users, payments, referrals, services, provider-applications, blogs
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'delete'>('delete');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [referrals, setReferrals] = useState<UserReferral[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: { labels: [], data: [] },
    revenue: { labels: [], data: [] },
    userTypes: { labels: [], data: [] },
    servicePopularity: { labels: [], data: [] }
  });
  const ITEMS_PER_PAGE = 10;

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
          (user) => user.role === "provider"
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

  useEffect(() => {
    if (activeTable === 'provider-applications') {
      fetchApplications();
    } else if (activeTable === 'blogs') {
      const fetchBlogs = async () => {
        try {
          const blogs = await BlogModel.getAll();
          const formattedBlogs: BlogPost[] = blogs.map(blog => ({
            id: blog.id,
            title: blog.title || '',
            author: blog.author || '',
            publishedDate: blog.publishedDate || new Date().toISOString(),
            readTime: blog.readTime || '5 min read',
            description: blog.description || '',
            imageUrl: blog.imageUrl || '',
            tags: blog.tags || []
          }));
          setBlogPosts(formattedBlogs);
        } catch (error) {
          console.error('Error fetching blogs:', error);
          toast({
            title: "Error",
            description: "Failed to fetch blog posts",
            variant: "destructive",
          });
        }
      };
      fetchBlogs();
    } else if (activeTable === 'payments') {
      fetchPayments();
    } else if (activeTable === 'referrals') {
      fetchReferrals();
    }
  }, [activeTable]);

  const fetchPayments = async () => {
    try {
      const db = getFirestore();
      const paymentsSnapshot = await getDocs(collection(db, 'payments'));
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Payment));

      setPayments(paymentsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const db = getFirestore();
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
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const db = getFirestore();
      const applicationsRef = collection(db, 'provider-applications');
      const q = query(applicationsRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      
      const apps: ProviderApplication[] = [];
      querySnapshot.forEach((doc) => {
        apps.push({ ...doc.data(), userId: doc.id } as ProviderApplication);
      });
      
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplicationReview = async (
    applicationId: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      const db = getFirestore();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to review applications",
          variant: "destructive",
        });
        return;
      }
      
      // Update application status
      await updateDoc(doc(db, 'provider-applications', applicationId), {
        status,
        reviewDate: new Date(),
        reviewedBy: currentUser.uid
      });

      // Update user role if approved
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', applicationId), {
          role: 'provider',
          providerSince: new Date(),
          applicationStatus: 'approved'
        });

        // Get the application data to send email
        const applicationDoc = await getDoc(doc(db, 'provider-applications', applicationId));
        const applicationData = applicationDoc.data();

        if (applicationData) {
          // Send approval email using EmailJS
          try {
            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
              process.env.NEXT_PUBLIC_EMAILJS_PROVIDER_APPROVAL_TEMPLATE_ID!,
              {
                to_email: applicationData.email,
                to_name: applicationData.userName,
                from_name: "Dudh-Kela Support",
                reply_to: "support@dudhkela.com",
                subject: "Welcome to Dudh-Kela as a Service Provider!",
                services: applicationData.services.join(', '),
                service_areas: applicationData.servicePincodes.map((p: { pincode: string }) => p.pincode).join(', '),
                application_date: new Date(applicationData.applicationDate).toLocaleDateString(),
                approval_date: new Date().toLocaleDateString(),
              },
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
            );

            toast({
              title: "Email Sent",
              description: "Provider approval notification email sent successfully",
            });
          } catch (emailError) {
            console.error('Error sending approval email:', emailError);
            toast({
              title: "Email Error",
              description: "Failed to send approval notification email",
              variant: "destructive",
            });
          }
        }
      } else {
        await updateDoc(doc(db, 'users', applicationId), {
          applicationStatus: 'rejected'
        });
      }

      toast({
        title: `Application ${status}`,
        description: `Successfully ${status} the provider application.`,
      });

      // Refresh applications list
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} the application`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await BlogModel.delete(blogId);
      setBlogPosts((prevPosts) => prevPosts.filter((post) => post.id !== blogId));
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  };

  // Reset page when changing tables
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTable]);

  const fetchAnalyticsData = async () => {
    try {
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, "users"));
      const paymentsSnapshot = await getDocs(collection(db, "payments"));
      const servicesSnapshot = await getDocs(collection(db, "services"));

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAnalytics));
      const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentAnalytics));
      const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceAnalytics));

      // Calculate daily data for the last 30 days
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

      // Calculate daily revenue
      const revenueData = days.map(day => {
        return payments
          .filter(payment => {
            const paymentDate = new Date(payment.createdAt).toISOString().split('T')[0];
            return paymentDate === day && payment.status === 'completed';
          })
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      });

      // Format dates for display
      const formattedDays = days.map(day => {
        const date = new Date(day);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });

      // Calculate user types distribution
      const userTypes = {
        regular: users.filter(user => user.role === 'user').length,
        provider: users.filter(user => user.role === 'provider').length,
        admin: users.filter(user => user.role === 'admin').length
      };

      // Calculate service popularity
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
      console.error('Error fetching analytics data:', error);
    }
  };

  useEffect(() => {
    if (activeTable === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTable]);

  const renderContent = () => {
    switch (activeTable) {
      case "analytics":
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
      case "users":
        return (
          <div className="space-y-4">
            <UsersCard currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(stats.totalUsers / ITEMS_PER_PAGE))}
              onPageChange={setCurrentPage}
            />
          </div>
        );
      case "payments":
        return (
          <div className="space-y-4">
            <PaymentsCard 
              currentPage={currentPage} 
              itemsPerPage={ITEMS_PER_PAGE} 
              payments={payments}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE))}
              onPageChange={setCurrentPage}
            />
          </div>
        );
      case "referrals":
        return (
          <div className="space-y-4">
            <ReferralsCard currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(referrals.length / ITEMS_PER_PAGE))}
              onPageChange={setCurrentPage}
            />
          </div>
        );
      case "services":
        const paginatedServices = getPaginatedData(services, currentPage);
        return (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Services Management
              </h2>
              <Button
                onClick={() => router.push("/services/add")}
                className="w-full sm:w-auto bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
              >
                Add New Service
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {paginatedServices.map((service) => (
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
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE))}
              onPageChange={setCurrentPage}
            />
          </div>
        );
      case "provider-applications":
        const paginatedApplications = getPaginatedData(applications, currentPage);
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                Provider Applications
              </h2>
              <Badge variant="outline" className="px-3 py-1">
                {applications.length} Pending
              </Badge>
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
              {applications.length > 0 ? (
                <div className="divide-y divide-black/10 dark:divide-white/10">
                  {paginatedApplications.map((application) => (
                    <div key={application.userId} className="p-4 bg-white dark:bg-black hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Provider Image */}
                        <img 
                          src={`https://res.cloudinary.com/service_providers/image/upload/${application.photo}`}
                          alt={application.userName}
                          className="w-16 h-16 rounded-full object-cover border border-black/10 dark:border-white/10"
                        />
                        
                        {/* Provider Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="font-medium text-black dark:text-white truncate">
                                {application.userName}
                              </h3>
                              <p className="text-sm text-black/60 dark:text-white/60">
                                {application.email}
                              </p>
                            </div>
                            <Badge>
                              {application.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-black/40 dark:text-white/40">Services:</span>{' '}
                              <span className="text-black/80 dark:text-white/80">{application.services.join(', ')}</span>
                            </div>
                            <div>
                              <span className="text-black/40 dark:text-white/40">Areas:</span>{' '}
                              <span className="text-black/80 dark:text-white/80">{application.servicePincodes.map((p: { pincode: string }) => p.pincode).join(', ')}</span>
                            </div>
                          </div>

                          {application.status === 'pending' && (
                            <div className="mt-4 flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApplicationReview(application.userId, 'approved')}
                                className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                              >
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplicationReview(application.userId, 'rejected')}
                                className="border-black/20 hover:border-black hover:bg-black hover:text-white dark:border-white/20 dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                              >
                                <XCircle className="w-4 h-4 mr-1.5" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-black/40 dark:text-white/40" />
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-1">
                    No Pending Applications
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    There are currently no provider applications to review
                  </p>
                </div>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(applications.length / ITEMS_PER_PAGE))}
              onPageChange={setCurrentPage}
            />
          </div>
        );
      case "blogs":
        const paginatedBlogs = getPaginatedData(blogPosts, currentPage);
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                Blog Management
              </h2>
              <Button
                onClick={() => router.push('/blog/newblog')}
                className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Blog
              </Button>
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
              {blogPosts.length > 0 ? (
                <div className="divide-y divide-black/10 dark:divide-white/10">
                  {paginatedBlogs.map((post) => (
                    <div key={post.id} className="p-4 bg-white dark:bg-black hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-4">
                        <img 
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-20 h-20 rounded-lg object-cover border border-black/10 dark:border-white/10"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="font-medium text-black dark:text-white truncate">
                                {post.title}
                              </h3>
                              <p className="text-sm text-black/60 dark:text-white/60 line-clamp-2">
                                {post.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-4 text-sm text-black/60 dark:text-white/60">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              {post.tags.join(', ')}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => router.push(`/blog/editblog?id=${post.id}`)}
                              className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                            >
                              Edit Blog
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBlog(post);
                                setDialogType('delete');
                                setDialogOpen(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete Blog
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                    <PenSquare className="h-6 w-6 text-black/40 dark:text-white/40" />
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-1">
                    No Blog Posts Yet
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Create your first blog post to get started
                  </p>
                </div>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(blogPosts.length / ITEMS_PER_PAGE))}
              onPageChange={setCurrentPage}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
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
                    variant={activeTable === "analytics" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTable("analytics");
                      setIsMenuOpen(false);
                    }}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </div>
              </SheetHeader>
              <div className="px-6 py-4 flex flex-col space-y-2">
                <Button
                  variant={activeTable === "users" ? "default" : "ghost"}
                  className="justify-start w-full"
                  onClick={() => {
                    setActiveTable("users");
                    setIsMenuOpen(false);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  All Users
                </Button>
                <Button
                  variant={activeTable === "payments" ? "default" : "ghost"}
                  className="justify-start w-full"
                  onClick={() => {
                    setActiveTable("payments");
                    setIsMenuOpen(false);
                  }}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Recent Payments
                </Button>
                <Button
                  variant={activeTable === "referrals" ? "default" : "ghost"}
                  className="justify-start w-full"
                  onClick={() => {
                    setActiveTable("referrals");
                    setIsMenuOpen(false);
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Referral History
                </Button>
                <Button
                  variant={activeTable === "services" ? "default" : "ghost"}
                  className="justify-start w-full"
                  onClick={() => {
                    setActiveTable("services");
                    setIsMenuOpen(false);
                  }}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Services
                </Button>
                <Button
                  variant={activeTable === "provider-applications" ? "default" : "ghost"}
                  className="justify-start w-full"
                  onClick={() => {
                    setActiveTable("provider-applications");
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Provider Applications
                </Button>
                <Button
                  variant={activeTable === "blogs" ? "default" : "ghost"}
                  className="justify-start w-full"
                  onClick={() => {
                    setActiveTable("blogs");
                    setIsMenuOpen(false);
                  }}
                >
                  <PenSquare className="mr-2 h-4 w-4" />
                  Blog Management
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white ml-4">
            Admin Dashboard
          </h2>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Content Area */}
        <div className="mt-6">
          {renderContent()}
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

      {/* Blog Delete Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white dark:bg-black border border-black dark:border-white">
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-black dark:border-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedBlog) {
                  handleDeleteBlog(selectedBlog.id);
                }
                setDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
