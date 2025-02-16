"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  MapPin,
  Upload,
  ArrowLeft,
  Users,
  Calendar,
  Star,
  Settings,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@/lib/firebase";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getCityFromPincode } from "@/lib/utils/pincode";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import emailjs from "@emailjs/browser";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";

interface ProviderData {
  photo: string;
  name?: string;
  servicePincodes: Array<{
    pincode: string;
    city?: string;
    state?: string;
  }>;
  services: string[];
}

interface ServiceRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPincode: string;
  customerCity: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  isPaid?: boolean;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Date;
  completedAt?: Date;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPincode: string;
  customerCity: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  status: "pending" | "accepted" | "rejected" | "completed" | "paid";
  createdAt: Date;
  updatedAt: Date;
  paymentDate: Date;
  paymentMethod: "cod" | "online";
  providerName: string;
  providerId: string;
}

export default function ProviderDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [providerData, setProviderData] = useState<ProviderData>({
    photo: "",
    servicePincodes: [],
    services: [],
  });
  const [pincodeInput, setPincodeInput] = useState("");
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<ServiceRequest[]>(
    []
  );
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>(
    []
  );
  const [statistics, setStatistics] = useState({
    todaysBookings: 0,
    totalCustomers: 0,
    averageRating: 0,
    serviceAreas: 0,
  });
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of items to show per page
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompletedRequests = completedRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(completedRequests.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: document.getElementById("completed-services")?.offsetTop,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        const db = getFirestore();
        const providerDoc = await getDoc(
          doc(db, "provider-applications", user.uid)
        );

        if (providerDoc.exists()) {
          const data = providerDoc.data();
          setProviderData({
            photo: data.photo || "",
            servicePincodes: data.servicePincodes || [],
            services: data.services || [],
          });
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
        toast({
          title: "Error",
          description: "Failed to load provider data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!auth.currentUser) return;

      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Query for service requests
      const db = getFirestore();
      const requestsQuery = query(
        collection(db, "serviceRequests"),
        where("providerId", "==", auth.currentUser.uid)
      );

      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs.map((doc) => doc.data());

      // Calculate statistics
      const todaysBookings = requests.filter(
        (req) =>
          new Date(req.createdAt).setHours(0, 0, 0, 0) === today.getTime()
      ).length;

      // Get unique customers
      const uniqueCustomers = new Set(requests.map((req) => req.customerEmail))
        .size;

      // Calculate average rating from completed services with reviews
      const completedWithReviews = requests.filter((req) => req.rating);
      const averageRating =
        completedWithReviews.length > 0
          ? completedWithReviews.reduce((sum, req) => sum + req.rating, 0) /
            completedWithReviews.length
          : 0;

      // Get service areas count from provider data
      const serviceAreas = providerData.servicePincodes.length;

      setStatistics({
        todaysBookings,
        totalCustomers: uniqueCustomers,
        averageRating: Number(averageRating.toFixed(1)),
        serviceAreas,
      });
    };

    fetchStatistics();
  }, [auth.currentUser, providerData.servicePincodes]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const db = getFirestore();
    const requestsRef = collection(db, "serviceRequests");

    // Query for paid orders assigned to this provider
    const paidQuery = query(
      requestsRef,
      where("providerId", "==", auth.currentUser.uid),
      where("status", "==", "paid")
    );

    const unsubscribePaid = onSnapshot(paidQuery, (snapshot) => {
      const paidOrdersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        paymentDate: doc.data().paymentDate?.toDate?.() || new Date(),
        customerName: doc.data().customerName,
        customerEmail: doc.data().customerEmail,
        customerAddress: doc.data().customerAddress,
        customerPincode: doc.data().customerPincode,
        serviceType: doc.data().serviceType,
        serviceDate: doc.data().serviceDate,
        amount: doc.data().amount,
        rating: doc.data().rating,
        review: doc.data().review,
        customerCity: doc.data().customerCity,
        items: doc.data().items || [],
        status: doc.data().status,
        paymentMethod: doc.data().paymentMethod,
        totalAmount: doc.data().totalAmount,
        tax: doc.data().tax,
        providerName: providerData?.name || "",
        providerId: auth.currentUser?.uid || "",
      }));
      setPaidOrders(paidOrdersData);
    });

    return () => {
      unsubscribePaid();
    };
  }, [auth.currentUser]);

  const handlePincodeAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const pincode = pincodeInput.trim();

      if (!pincode || !/^\d{6}$/.test(pincode)) {
        toast({
          title: "Invalid Pincode",
          description: "Please enter a valid 6-digit pincode",
          variant: "destructive",
        });
        return;
      }

      if (providerData.servicePincodes.some((p) => p.pincode === pincode)) {
        toast({
          title: "Duplicate Pincode",
          description: "This pincode has already been added",
          variant: "destructive",
        });
        return;
      }

      setIsValidatingPincode(true);
      try {
        const data = await getCityFromPincode(pincode);
        if (!data?.city) {
          toast({
            title: "Invalid Pincode",
            description: "Could not find location for this pincode",
            variant: "destructive",
          });
          return;
        }

        setProviderData((prev) => ({
          ...prev,
          servicePincodes: [
            ...prev.servicePincodes,
            {
              pincode,
              city: data.city,
              state: data.state,
            },
          ],
        }));
        setPincodeInput("");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to validate pincode",
          variant: "destructive",
        });
      } finally {
        setIsValidatingPincode(false);
      }
    }
  };

  const handleServiceToggle = (service: string) => {
    setProviderData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSaveChanges = () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save changes.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    if (providerData.servicePincodes.length === 0) {
      toast({
        title: "Service area required",
        description:
          "Please add at least one pincode where you can provide services",
        variant: "destructive",
      });
      return;
    }

    if (providerData.services.length === 0) {
      toast({
        title: "Services required",
        description: "Please select at least one service you can provide",
        variant: "destructive",
      });
      return;
    }

    setShowSaveDialog(true);
  };

  const handleConfirmedSave = async () => {
    setShowSaveDialog(false);
    setIsSaving(true);
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Create a batch with writeBatch instead of db.batch()
      const batch = writeBatch(db);
      
      const providerAppRef = doc(db, "provider-applications", user.uid);
      const providerRef = doc(db, "providers", user.uid);

      // Check if documents exist
      const [providerAppDoc, providerDoc] = await Promise.all([
        getDoc(providerAppRef),
        getDoc(providerRef)
      ]);

      const updateData = {
        servicePincodes: providerData.servicePincodes,
        services: providerData.services,
        updatedAt: new Date(),
      };

      // If provider-applications document exists, update it
      if (providerAppDoc.exists()) {
        batch.update(providerAppRef, updateData);
      } else {
        batch.set(providerAppRef, {
          ...updateData,
          uid: user.uid,
          createdAt: new Date(),
        });
      }

      // If providers document exists, update it
      if (providerDoc.exists()) {
        batch.update(providerRef, updateData);
      } else {
        batch.set(providerRef, {
          ...updateData,
          uid: user.uid,
          createdAt: new Date(),
        });
      }

      await batch.commit();

      toast({
        title: "Changes saved",
        description: "Your provider profile has been updated successfully.",
      });

    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const db = getFirestore();
      const request = serviceRequests.find((r) => r.id === requestId);

      if (!request) {
        throw new Error("Request not found");
      }

      const statusMap = {
        accept: "accepted",
        reject: "rejected",
      } as const;

      await updateDoc(doc(db, "serviceRequests", requestId), {
        status: statusMap[action],
        providerName: auth.currentUser?.displayName || "Service Provider",
        providerId: auth.currentUser?.uid,
        updatedAt: new Date(),
      });

      toast({
        title: action === "accept" ? "Request Accepted" : "Request Rejected",
        description: `You have ${action}ed the service request`,
        variant: action === "accept" ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} request. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleServiceCompletion = async (requestId: string) => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "serviceRequests", requestId), {
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      });

      toast({
        title: "Service Marked as Completed",
        description: "The service request has been marked as completed.",
      });
    } catch (error) {
      console.error("Error marking service as completed:", error);
      toast({
        title: "Error",
        description: "Failed to mark service as completed. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const db = getFirestore();
    const providerDoc = doc(db, "providers", auth.currentUser.uid);

    getDoc(providerDoc).then((doc) => {
      const providerPincodes =
        doc.data()?.servicePincodes?.map((p: any) => p.pincode) || [];
      const requestsRef = collection(db, "serviceRequests");

      // Create queries for both pending and accepted requests
      const pendingQuery = query(
        requestsRef,
        where("status", "==", "pending"),
        where("customerPincode", "in", providerPincodes)
      );

      const acceptedQuery = query(
        requestsRef,
        where("status", "==", "accepted"),
        where("providerId", "==", auth.currentUser!.uid)
      );

      // Set up listeners for both queries
      const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
        const requests: ServiceRequest[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          customerName: doc.data().customerName,
          customerEmail: doc.data().customerEmail,
          customerAddress: doc.data().customerAddress,
          customerPincode: doc.data().customerPincode,
          customerCity: doc.data().customerCity,
          items: doc.data().items,
          status: doc.data().status,
          createdAt: doc.data().createdAt.toDate(),
        }));
        setServiceRequests(requests);
      });

      const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
        const requests: ServiceRequest[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          customerName: doc.data().customerName,
          customerEmail: doc.data().customerEmail,
          customerAddress: doc.data().customerAddress,
          customerPincode: doc.data().customerPincode,
          customerCity: doc.data().customerCity,
          items: doc.data().items,
          status: doc.data().status,
          createdAt: doc.data().createdAt.toDate(),
        }));
        setAcceptedRequests(requests);
      });

      return () => {
        unsubscribePending();
        unsubscribeAccepted();
      };
    });
  }, [auth.currentUser]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const db = getFirestore();
    const providerDoc = doc(db, "providers", auth.currentUser.uid);

    getDoc(providerDoc).then((doc) => {
      const providerPincodes =
        doc.data()?.servicePincodes?.map((p: any) => p.pincode) || [];
      const requestsRef = collection(db, "serviceRequests");

      // Create query for completed requests
      const completedQuery = query(
        requestsRef,
        where("status", "==", "completed"),
        where("customerPincode", "in", providerPincodes)
      );

      // Set up listener for completed requests
      const unsubscribeCompleted = onSnapshot(completedQuery, (snapshot) => {
        const requests: ServiceRequest[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          customerName: doc.data().customerName,
          customerEmail: doc.data().customerEmail,
          customerAddress: doc.data().customerAddress,
          customerPincode: doc.data().customerPincode,
          customerCity: doc.data().customerCity,
          items: doc.data().items,
          status: doc.data().status,
          createdAt: doc.data().createdAt.toDate(),
          completedAt: doc.data().completedAt?.toDate(),
        }));
        setCompletedRequests(requests);
      });

      return () => {
        unsubscribeCompleted();
      };
    });
  }, [auth.currentUser]);

  const fetchAvailableServices = async () => {
    try {
      const db = getFirestore();
      const servicesSnapshot = await getDocs(collection(db, "services"));
      
      // Extract unique service names
      const serviceNames = new Set<string>();
      servicesSnapshot.forEach((doc) => {
        const service = doc.data();
        if (service.name) {
          serviceNames.add(service.name);
        }
      });
      
      // Convert to array and sort alphabetically
      const sortedServices = Array.from(serviceNames).sort();
      
      setAvailableServices(sortedServices);
    } catch (error) {
      console.error("Error fetching available services:", error);
    }
  };

  useEffect(() => {
    fetchAvailableServices();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Service Requests Section */}
            <div className="bg-white dark:bg-black rounded-xl shadow-sm p-6 border-2 border-black/10 dark:border-white/10">
              <h2 className="text-xl font-semibold mb-2">Service Requests</h2>
              <p className="text-black/60 dark:text-white/60 text-sm mb-6">
                Manage incoming service requests
              </p>
              {serviceRequests.length === 0 ? (
                <p className="text-black/60 dark:text-white/60">
                  No pending requests
                </p>
              ) : (
                <div className="space-y-4">
                  {serviceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border border-black/10 dark:border-white/10 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">
                            {request.customerName}
                          </h4>
                          <p className="text-sm text-black/60 dark:text-white/60">
                            {request.customerAddress}, {request.customerCity} -{" "}
                            {request.customerPincode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRequestAction(request.id, "reject")
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleRequestAction(request.id, "accept")
                            }
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {request.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t border-black/10 dark:border-white/10 mt-2 pt-2 flex justify-between font-medium">
                          <span>Total</span>
                          <span>
                            ₹
                            {request.items.reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accepted Requests Section */}
            <div className="bg-white dark:bg-black rounded-xl shadow-sm p-6 border-2 border-black/10 dark:border-white/10">
              <h2 className="text-xl font-semibold mb-2">Accepted Requests</h2>
              <p className="text-black/60 dark:text-white/60 text-sm mb-6">
                View and manage accepted requests (Not paid)
              </p>
              {acceptedRequests.filter(
                (request) => !request.isPaid && request.status !== "completed"
              ).length === 0 ? (
                <p className="text-black/60 dark:text-white/60">
                  No pending accepted requests
                </p>
              ) : (
                <div className="space-y-4">
                  {acceptedRequests
                    .filter(
                      (request) =>
                        !request.isPaid && request.status !== "completed"
                    )
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border border-black/10 dark:border-white/10 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">
                              {request.customerName}
                            </h4>
                            <p className="text-sm text-black/60 dark:text-white/60">
                              {request.customerAddress}, {request.customerCity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-black/10 dark:bg-white/10 text-black dark:text-white">
                              Accepted
                            </Badge>
                            <Button
                              onClick={() =>
                                handleServiceCompletion(request.id)
                              }
                              variant="outline"
                              size="sm"
                            >
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {request.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.name} × {item.quantity}
                              </span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="border-t border-black/10 dark:border-white/10 mt-2 pt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span>
                              ₹
                              {request.items.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Paid But Not Completed Section */}
            <div className="bg-white dark:bg-black rounded-xl shadow-sm p-6 border-2 border-black/10 dark:border-white/10">
              <h2 className="text-xl font-semibold mb-2">
                Paid Services (Pending)
              </h2>
              <p className="text-black/60 dark:text-white/60 text-sm mb-6">
                Services paid but not completed
              </p>
              {paidOrders.filter((order) => order.status !== "completed")
                .length === 0 ? (
                <p className="text-black/60 dark:text-white/60">
                  No pending paid services
                </p>
              ) : (
                <div className="space-y-4">
                  {paidOrders
                    .filter((order) => order.status !== "completed")
                    .map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-black/10 dark:border-white/10 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">
                              {order.customerName}
                            </h4>
                            <p className="text-sm text-black/60 dark:text-white/60">
                              {order.customerAddress}, {order.customerCity}
                            </p>
                            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                              Payment:{" "}
                              {order.paymentMethod === "cod"
                                ? "Cash on Delivery"
                                : "Online"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-black/10 dark:bg-white/10 text-black dark:text-white">
                              Paid (Pending)
                            </Badge>
                            <Button
                              onClick={() => handleServiceCompletion(order.id)}
                              variant="outline"
                              size="sm"
                            >
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.name} × {item.quantity}
                              </span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="border-t border-black/10 dark:border-white/10 mt-2 pt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span>
                              ₹
                              {order.items.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Completed Services Section */}
          <div
            id="completed-services"
            className="bg-white dark:bg-black rounded-xl shadow-sm p-6 border-2 border-black/10 dark:border-white/10 mb-8"
          >
            <h2 className="text-xl font-semibold mb-2">Completed Services</h2>
            <p className="text-black/60 dark:text-white/60 text-sm mb-6">
              View completed service history
            </p>
            {completedRequests.length === 0 ? (
              <p className="text-black/60 dark:text-white/60">
                No completed services
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentCompletedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border border-black/10 dark:border-white/10 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">
                            {request.customerName}
                          </h4>
                          <p className="text-sm text-black/60 dark:text-white/60">
                            {request.customerAddress}, {request.customerCity}
                          </p>
                          <p className="text-black/60 dark:text-white/60 mt-1">
                            Completed on{" "}
                            {request.completedAt
                              ? format(new Date(request.completedAt), "PPP")
                              : "N/A"}
                          </p>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500">
                          Completed
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {request.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t border-black/10 dark:border-white/10 mt-2 pt-2 flex justify-between font-medium">
                          <span>Total</span>
                          <span>
                            ₹
                            {request.items.reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>

          {/* Main Content */}
          <Card className="border border-black/10 dark:border-white/10">
            <div className="p-6 border-b border-black/10 dark:border-white/10">
              <h3 className="text-lg font-semibold">Provider Profile</h3>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                Manage your services and service areas
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Service Areas Column */}
                <div>
                  <Label className="text-sm mb-2 block">Service Areas</Label>
                  <Input
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    onKeyDown={handlePincodeAdd}
                    placeholder="Enter pincode"
                    maxLength={6}
                    disabled={isValidatingPincode}
                    className="w-48 mb-4"
                  />
                  <div className="flex flex-wrap gap-2">
                    {providerData.servicePincodes.map(({ pincode, city }) => (
                      <div
                        key={pincode}
                        className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-sm flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{pincode}</span>
                        {city && (
                          <span className="text-black/60 dark:text-white/60">
                            ({city})
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setProviderData((prev) => ({
                              ...prev,
                              servicePincodes: prev.servicePincodes.filter(
                                (p) => p.pincode !== pincode
                              ),
                            }))
                          }
                          className="hover:text-black dark:hover:text-white ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Services Column */}
                <div>
                  <Label className="text-sm mb-2 block">
                    Selected Services ({providerData.services.length})
                  </Label>
                  <div className="h-[400px] overflow-y-auto rounded-lg bg-black/5 dark:bg-white/5 p-4">
                    {providerData.services.length === 0 ? (
                      <p className="text-sm text-black/60 dark:text-white/60">
                        No services selected yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {providerData.services.map((service) => (
                          <div
                            key={service}
                            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black"
                          >
                            <span className="text-sm">{service}</span>
                            <button
                              onClick={() => handleServiceToggle(service)}
                              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Services Column */}
                <div>
                  <Label className="text-sm mb-2 block">
                    Available Services
                  </Label>
                  <div className="h-[400px] overflow-y-auto rounded-lg bg-black/5 dark:bg-white/5 p-4">
                    <div className="space-y-2">
                      {availableServices.map((service) => (
                        <div
                          key={service}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <Checkbox
                            id={service}
                            checked={providerData.services.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <label
                            htmlFor={service}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="w-full mt-8 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
              >
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
