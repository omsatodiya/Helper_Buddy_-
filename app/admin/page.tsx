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
} from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReferralsCard } from "@/components/admin/ReferralsCard";
import { UsersCard } from "@/components/admin/UsersCard";
import { PaymentsCard } from "@/components/admin/PaymentsCard";
import { cn } from "@/lib/utils";
import { getFirestore, getDocs, collection, query, where, updateDoc, doc } from "firebase/firestore";
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
    }
  }, [activeTable]);

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

  useEffect(() => {
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

    if (activeTable === 'blogs') {
      fetchBlogs();
    }
  }, [activeTable]);

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
                className="w-full sm:w-auto bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
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
      case "provider-applications":
        return (
          <div className="space-y-6">
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
                  {applications.map((application) => (
                    <div key={application.userId} className="p-4 bg-white dark:bg-black hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Provider Image */}
                        <img 
                          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${application.photo}`}
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
                              <span className="text-black/80 dark:text-white/80">{application.servicePincodes.map(p => p.pincode).join(', ')}</span>
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
          </div>
        );
      case "blogs":
        return (
          <div className="space-y-6">
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
                  {blogPosts.map((post) => (
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

        {/* Navigation Tabs */}
        <div className="mt-8 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-4 shadow-sm">
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="provider-applications"
                id="provider-applications"
                className="dark:border-gray-700"
              />
              <Label
                htmlFor="provider-applications"
                className="cursor-pointer dark:text-gray-200"
              >
                Provider Applications
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="blogs"
                id="blogs"
                className="dark:border-gray-700"
              />
              <Label
                htmlFor="blogs"
                className="cursor-pointer dark:text-gray-200"
              >
                Blog Management
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTable === "services" ? (
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
            <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg shadow-sm p-6">
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
