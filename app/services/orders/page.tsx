"use client";
import { useState, useEffect } from "react";
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
    | "rejected"
    | "completed"
    | "paid"
    | "cancelled";
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  providerName?: string;
  serviceId?: string;
  isReviewed?: boolean;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { setSearchQuery } = useSearch();

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

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { class: "bg-yellow-500/10 text-yellow-500", label: "Pending" },
      accepted: { class: "bg-blue-500/10 text-blue-500", label: "Accepted" },
      rejected: { class: "bg-red-500/10 text-red-500", label: "Rejected" },
      completed: {
        class: "bg-green-500/10 text-green-500",
        label: "Completed",
      },
      paid: { class: "bg-purple-500/10 text-purple-500", label: "Paid" },
      cancelled: { class: "bg-gray-500/10 text-gray-500", label: "Cancelled" },
    };

    return (
      <Badge className={`${statusConfig[status].class} px-3 py-1 rounded-full`}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Service Requests</h1>

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
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(order.createdAt)}
                            </p>
                            {order.providerName && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Provider: {order.providerName}
                              </p>
                            )}
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
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                  × {item.quantity}
                                </span>
                              </div>
                              <span className="font-medium">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t dark:border-gray-700 pt-4">
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
                                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                                >
                                  Write a Review
                                </Button>
                              )}
                            {order.status === "accepted" && (
                              <Button
                                onClick={() => handlePayment(order)}
                                className="w-full bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 dark:text-black text-white"
                              >
                                Proceed to Payment
                              </Button>
                            )}
                            {order.status === "pending" && (
                              <Button
                                onClick={() => handleCancelRequest(order.id)}
                                variant="destructive"
                                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white transition-colors"
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
                      className="text-center py-12"
                    >
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No service requests found
                      </p>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Request Statistics</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-yellow-500/10">
                  <p className="text-yellow-500 font-medium">Pending</p>
                  <p className="text-2xl font-bold mt-1">
                    {
                      orders.filter((order) => order.status === "pending")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10">
                  <p className="text-blue-500 font-medium">Accepted</p>
                  <p className="text-2xl font-bold mt-1">
                    {
                      orders.filter((order) => order.status === "accepted")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-500/10">
                  <p className="text-green-500 font-medium">Completed</p>
                  <p className="text-2xl font-bold mt-1">
                    {
                      orders.filter((order) => order.status === "completed")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-500/10">
                  <p className="text-gray-500 font-medium">Cancelled</p>
                  <p className="text-2xl font-bold mt-1">
                    {
                      orders.filter((order) => order.status === "cancelled")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/10">
                  <p className="text-purple-500 font-medium">Paid</p>
                  <p className="text-2xl font-bold mt-1">
                    {orders.filter((order) => order.status === "paid").length}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
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
