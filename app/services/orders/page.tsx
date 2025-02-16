"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/firebase";
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
import { motion } from "framer-motion";
import { useSearch } from "@/context/SearchContext";
import { formatDate } from "@/lib/utils/date";
import { Home, Star } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

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
    | "completed"
    | "paid"
    | "cancelled"
    | "rejected";
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
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6; // Show 6 orders per page (2 rows x 3 columns)

  useEffect(() => {
    if (!user) {
      if (!authLoading) {
        router.push("/auth/login");
      }
      return;
    }

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

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: {
        class: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
        label: "Pending",
      },
      accepted: {
        class: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
        label: "Accepted",
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
      rejected: {
        class: "bg-red-500/10 text-red-500 border border-red-500/20",
        label: "Rejected",
      },
    } as const;

    return (
      <Badge className={`${statusConfig[status].class} px-3 py-1 rounded-full`}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Orders Grid */}
          <div className="lg:col-span-3">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4 hover:border-black dark:hover:border-white transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-base font-semibold">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-black/60 dark:text-white/60">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="font-medium">
                              {item.name} × {item.quantity}
                            </span>
                            <span>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-black/10 dark:border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">Total</span>
                          <span className="font-semibold">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>

                        {order.status === "pending" && (
                          <Button
                            onClick={() => handleCancelRequest(order.id)}
                            variant="destructive"
                            className="w-full"
                          >
                            Cancel Request
                          </Button>
                        )}
                        {order.status === "accepted" && (
                          <Button
                            onClick={() => handlePayment(order)}
                            className="w-full"
                          >
                            Proceed to Payment
                          </Button>
                        )}
                        {order.status === "completed" && !order.isReviewed && (
                          <Button
                            onClick={() => {
                              router.push(
                                `/services?search=${encodeURIComponent(
                                  order.items[0].name
                                )}&review=true&orderId=${order.id}`
                              );
                            }}
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {orders.length > ordersPerPage && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}

                {orders.length === 0 && (
                  <div className="col-span-full text-center py-12 border border-black/10 dark:border-white/10 rounded-xl">
                    <p className="text-black/60 dark:text-white/60 mb-4">
                      No orders found
                    </p>
                    <Button onClick={() => router.push("/services")}>
                      Browse Services
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-black/10 dark:border-white/10 rounded-xl p-6 sticky top-8 bg-white dark:bg-black">
              <h2 className="text-xl font-semibold mb-6">Request Statistics</h2>
              <div className="space-y-4">
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

                <div className="p-4 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors border border-green-500/10">
                  <p className="font-medium text-green-500">Completed</p>
                  <p className="text-2xl font-bold mt-1 text-green-500">
                    {
                      orders.filter((order) => order.status === "completed")
                        .length
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10">
                  <p className="font-medium text-red-500">Rejected</p>
                  <p className="text-2xl font-bold mt-1 text-red-500">
                    {
                      orders.filter((order) => order.status === "rejected")
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
