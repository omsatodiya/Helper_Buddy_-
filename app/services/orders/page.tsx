"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/context/SearchContext";
import { formatDate } from "@/lib/utils/date";
import { Home } from "lucide-react";
import gsap from "gsap";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPincode: string;
  customerCity: string;
  items: OrderItem[];
  status:
    | "pending"
    | "accepted"
    | "in_progress"
    | "completed"
    | "paid"
    | "cancelled"
    | "refunded"
    | "disputed";
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  serviceId?: string;
  isReviewed?: boolean;
  availableProviders: string[];
  providerResponses?: {
    [providerId: string]: {
      status: "pending" | "accepted" | "rejected";
      updatedAt: Date;
    };
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { setSearchQuery } = useSearch();

  // Add refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      if (!authLoading) {
        router.push("/auth/login");
      }
      return;
    }

    // Set up real-time listener
    const ordersRef = collection(db, "serviceRequests");
    const q = query(
      ordersRef,
      where("customerEmail", "==", user.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        })) as Order[];

        setOrders(ordersData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again later.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, router]);

  // Initial page load animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state - everything invisible
      gsap.set([headerRef.current, statsRef.current, ordersRef.current], {
        opacity: 0,
        y: 20,
      });

      // Create timeline for smooth sequence
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Animate header
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
      });

      // Animate stats cards
      if (statsRef.current) {
        tl.to(
          statsRef.current.children,
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.4,
          },
          "-=0.2"
        ); // Overlap with previous animation
      }

      // Animate orders
      if (ordersRef.current) {
        tl.to(
          ordersRef.current.children,
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.4,
          },
          "-=0.2"
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Animate new orders when they update
  useEffect(() => {
    if (!isLoading && ordersRef.current) {
      gsap.from(ordersRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, [orders, isLoading]);

  const handlePayment = (order: Order) => {
    try {
      router.push(`/payment?amount=${order.totalAmount}&orderId=${order.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed to payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async (orderId: string) => {
    try {
      await updateDoc(doc(db, "serviceRequests", orderId), {
        status: "cancelled",
        updatedAt: new Date(),
      });

      toast({
        title: "Service Cancelled",
        description: "Your service request has been cancelled successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel service request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getOrderStatus = (order: Order): Order["status"] => {
    if (["cancelled", "paid", "completed"].includes(order.status)) {
      return order.status;
    }

    if (!order.providerResponses) {
      return "pending";
    }

    const responses = Object.values(order.providerResponses);
    const totalProviders = order.availableProviders?.length || 0;
    const rejectionCount = responses.filter(
      (r) => r.status === "rejected"
    ).length;
    const acceptedCount = responses.filter(
      (r) => r.status === "accepted"
    ).length;

    if (acceptedCount > 0) {
      return "accepted";
    }

    if (rejectionCount === totalProviders && totalProviders > 0) {
      return "rejected";
    }

    return "pending";
  };

  const getStatusBadge = (order: Order) => {
    // If there's a provider response with "accepted" status, show as accepted
    if (order.providerResponses) {
      const responses = Object.values(order.providerResponses);
      const hasAccepted = responses.some((r) => r.status === "accepted");
      if (hasAccepted) {
        return (
          <Badge className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full">
            Accepted
          </Badge>
        );
      }
    }

    // Otherwise use the order's status
    const statusConfig = {
      pending: {
        class: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
        label: "Pending",
      },
      accepted: {
        class: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
        label: "Accepted",
      },
      in_progress: {
        class: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
        label: "In Progress",
      },
      completed: {
        class: "bg-green-500/10 text-green-500 border border-green-500/20",
        label: "Completed",
      },
      paid: {
        class: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
        label: "Paid",
      },
      cancelled: {
        class: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
        label: "Cancelled",
      },
      refunded: {
        class: "bg-pink-500/10 text-pink-500 border border-pink-500/20",
        label: "Refunded",
      },
      disputed: {
        class: "bg-red-500/10 text-red-500 border border-red-500/20",
        label: "Disputed",
      },
    };

    return (
      <Badge
        className={`${statusConfig[order.status].class} px-3 py-1 rounded-full`}
      >
        {statusConfig[order.status].label}
      </Badge>
    );
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-white dark:bg-black opacity-0"
    >
      <div className="container mx-auto px-4 py-8">
        <div ref={headerRef} className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Service Requests</h1>
          <Button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Orders List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div ref={ordersRef} className="grid gap-6">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl hover:border-black dark:hover:border-white transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-black/60 dark:text-white/60">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="space-y-3 mb-6">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <div className="flex items-center">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-black/60 dark:text-white/60 ml-2">
                                × {item.quantity}
                              </span>
                            </div>
                            <span className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-black/10 dark:border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total Amount</span>
                          <span className="font-semibold text-lg">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {order.status === "completed" &&
                            !order.isReviewed && (
                              <Button
                                onClick={() => {
                                  const serviceName = order.items[0]?.name;
                                  setSearchQuery(serviceName);
                                  router.push(
                                    `/services?search=${encodeURIComponent(
                                      serviceName
                                    )}&orderId=${
                                      order.id
                                    }&isCompleted=true&isReviewed=${!!order.isReviewed}`
                                  );
                                }}
                                className="w-full bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                              >
                                Write a Review
                              </Button>
                            )}
                          {order.status === "accepted" && (
                            <Button
                              onClick={() => handlePayment(order)}
                              className="w-full bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                            >
                              Proceed to Payment
                            </Button>
                          )}
                          {order.status === "pending" && (
                            <Button
                              onClick={() => handleCancelRequest(order.id)}
                              className="w-full bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                            >
                              Cancel Service Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {orders.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 border border-black/10 dark:border-white/10 rounded-xl"
                  >
                    <p className="text-black/60 dark:text-white/60 text-lg">
                      No service requests found
                    </p>
                    <Button
                      onClick={() => router.push("/services")}
                      className="mt-4 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                    >
                      Browse Services
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-black/10 dark:border-white/10 rounded-xl p-6 sticky top-8 bg-white dark:bg-black">
              <h2 className="text-xl font-semibold mb-6">Request Statistics</h2>
              <div ref={statsRef} className="space-y-4">
                <div className="p-4 rounded-lg bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors border border-yellow-500/10">
                  <p className="font-medium text-yellow-500">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-500">
                    {
                      orders.filter((order) => order.status === "pending")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors border border-blue-500/10">
                  <p className="font-medium text-blue-500">Accepted</p>
                  <p className="text-2xl font-bold mt-1 text-blue-500">
                    {
                      orders.filter((order) => order.status === "accepted")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/5 hover:bg-orange-500/10 transition-colors border border-orange-500/10">
                  <p className="font-medium text-orange-500">In Progress</p>
                  <p className="text-2xl font-bold mt-1 text-orange-500">
                    {
                      orders.filter((order) => order.status === "in_progress")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors border border-green-500/10">
                  <p className="font-medium text-green-500">Completed</p>
                  <p className="text-2xl font-bold mt-1 text-green-500">
                    {
                      orders.filter((order) => order.status === "completed")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 transition-colors border border-purple-500/10">
                  <p className="font-medium text-purple-500">Paid</p>
                  <p className="text-2xl font-bold mt-1 text-purple-500">
                    {orders.filter((order) => order.status === "paid").length}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-pink-500/5 hover:bg-pink-500/10 transition-colors border border-pink-500/10">
                  <p className="font-medium text-pink-500">Refunded</p>
                  <p className="text-2xl font-bold mt-1 text-pink-500">
                    {
                      orders.filter((order) => order.status === "refunded")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10">
                  <p className="font-medium text-red-500">Disputed</p>
                  <p className="text-2xl font-bold mt-1 text-red-500">
                    {
                      orders.filter((order) => order.status === "disputed")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-500/5 hover:bg-gray-500/10 transition-colors border border-gray-500/10">
                  <p className="font-medium text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold mt-1 text-gray-500">
                    {
                      orders.filter((order) => order.status === "cancelled")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/10 dark:border-white/10">
                  <p className="font-medium">Total Requests</p>
                  <p className="text-2xl font-bold mt-1">{orders.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
