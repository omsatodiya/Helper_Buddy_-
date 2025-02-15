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
  setDoc,
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

interface ProviderData {
  photo: string;
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
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Date;
  completedAt?: Date;
}

interface AvailableService {
  id: string;
  name: string;
  category: string;
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
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);

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
    const fetchAvailableServices = async () => {
      try {
        const db = getFirestore();
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          category: doc.data().category
        }));
        
        // Sort services by name
        servicesData.sort((a, b) => a.name.localeCompare(b.name));
        setAvailableServices(servicesData);
      } catch (error) {
        console.error("Error fetching available services:", error);
        toast({
          title: "Error",
          description: "Failed to load available services",
          variant: "destructive",
        });
      }
    };

    fetchAvailableServices();
  }, [toast]);

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

  const handleServiceToggle = (serviceId: string) => {
    setProviderData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
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
      if (!user) throw new Error("No authenticated user");

      // Update both provider-applications and providers collections
      const updates = {
        servicePincodes: providerData.servicePincodes,
        services: providerData.services,
        updatedAt: new Date(),
      };

      // Update provider application
      await updateDoc(doc(db, "provider-applications", user.uid), updates);

      // Update or create provider document
      const providerRef = doc(db, "providers", user.uid);
      const providerDoc = await getDoc(providerRef);

      if (providerDoc.exists()) {
        await updateDoc(providerRef, updates);
      } else {
        await setDoc(providerRef, {
          ...updates,
          createdAt: new Date(),
          userId: user.uid,
          status: "active",
        });
      }

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

      // Send email notification to customer when request is accepted
      if (action === "accept") {
        try {
          // Format service details with simple text formatting
          const formattedServiceDetails = request.items.map(item => 
            `${item.name}
            Quantity: ${item.quantity}
            Price: ₹${item.price} per unit
            Subtotal: ₹${item.price * item.quantity}
            ----------------------------------------`
          ).join('\n\n');

          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_REQUEST_ACCEPTED_TEMPLATE_ID!,
            {
              to_email: request.customerEmail,
              to_name: request.customerName,
              provider_name: auth.currentUser?.displayName || "Service Provider",
              service_details: formattedServiceDetails,
              total_amount: request.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
              from_name: "DudhKela Support",
              reply_to: request.customerEmail
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
          );

          toast({
            title: "Request Accepted",
            description: "Customer has been notified via email",
            variant: "default",
          });
        } catch (emailError) {
          console.error('Error sending acceptance email:', emailError);
          toast({
            title: "Request Accepted",
            description: "Request accepted but failed to send email notification",
            variant: "default",
          });
        }
      }

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
        variant: "default",
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

  const getServiceName = (serviceId: string) => {
    const service = availableServices.find(s => s.id === serviceId);
    return service?.name || serviceId;
  };

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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Today's Bookings
                  </p>
                  <p className="text-2xl font-semibold">0</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Total Customers
                  </p>
                  <p className="text-2xl font-semibold">0</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Average Rating
                  </p>
                  <p className="text-2xl font-semibold">0.0</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Service Areas
                  </p>
                  <p className="text-2xl font-semibold">
                    {providerData.servicePincodes.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Service Requests */}
          <Card className="border border-black/10 dark:border-white/10 my-8">
            <div className="p-6 border-b border-black/10 dark:border-white/10">
              <h3 className="text-lg font-semibold">Service Requests</h3>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                Manage incoming service requests from customers
              </p>
            </div>

            <div className="p-6">
              {serviceRequests.length === 0 ? (
                <p className="text-center text-black/60 dark:text-white/60">
                  No pending service requests
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
          </Card>

          {/* Accepted Requests */}
          <Card className="border border-black/10 dark:border-white/10 my-8">
            <div className="p-6 border-b border-black/10 dark:border-white/10">
              <h3 className="text-lg font-semibold">Accepted Requests</h3>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                View and manage your accepted service requests
              </p>
            </div>

            <div className="p-6">
              {acceptedRequests.length === 0 ? (
                <p className="text-center text-black/60 dark:text-white/60">
                  No accepted service requests
                </p>
              ) : (
                <div className="space-y-4">
                  {acceptedRequests.map((request) => (
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
                        <Badge className="bg-blue-500/10 text-blue-500">
                          Accepted
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
                      <div className="mt-4">
                        <Button
                          onClick={() => handleServiceCompletion(request.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                        >
                          Mark Service as Completed
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Main Content */}
          <Card className="border border-black/10 dark:border-white/10">
            <div className="p-6 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <h3 className="text-xl font-semibold">Provider Profile</h3>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                Manage your services and service areas
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Service Areas Column */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Service Areas</Label>
                    <span className="text-xs text-black/60 dark:text-white/60">
                      {providerData.servicePincodes.length} areas
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      onKeyDown={handlePincodeAdd}
                      placeholder="Enter pincode and press Enter"
                      maxLength={6}
                      disabled={isValidatingPincode}
                      className="w-full border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white"
                    />
                    {isValidatingPincode && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[100px] max-h-[300px] overflow-y-auto p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                    {providerData.servicePincodes.map(({ pincode, city }) => (
                      <div
                        key={pincode}
                        className="group px-3 py-1.5 bg-white dark:bg-black rounded-lg text-sm flex items-center gap-2 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
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
                          className="opacity-0 group-hover:opacity-100 hover:text-black dark:hover:text-white transition-all ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Services Column */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Selected Services</Label>
                    <span className="text-xs text-black/60 dark:text-white/60">
                      {providerData.services.length} selected
                    </span>
                  </div>
                  <div className="h-[400px] overflow-y-auto rounded-lg bg-black/5 dark:bg-white/5 p-4">
                    {providerData.services.length === 0 ? (
                      <p className="text-sm text-black/60 dark:text-white/60 text-center">
                        No services selected yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {providerData.services.map((serviceId) => (
                          <div
                            key={serviceId}
                            className="group flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-black border border-transparent hover:border-black dark:hover:border-white transition-colors"
                          >
                            <span className="text-sm">{getServiceName(serviceId)}</span>
                            <button
                              onClick={() => handleServiceToggle(serviceId)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all"
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Available Services</Label>
                    <span className="text-xs text-black/60 dark:text-white/60">
                      {availableServices.length} available
                    </span>
                  </div>
                  <div className="h-[400px] overflow-y-auto rounded-lg bg-black/5 dark:bg-white/5 p-4">
                    <div className="space-y-2">
                      {availableServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-white dark:hover:bg-black transition-colors cursor-pointer"
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <Checkbox
                            id={service.id}
                            checked={providerData.services.includes(service.id)}
                            className="border-black/20 dark:border-white/20"
                          />
                          <label
                            htmlFor={service.id}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            <span className="font-medium">{service.name}</span>
                            {service.category && (
                              <span className="text-xs text-black/60 dark:text-white/60 ml-2 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                {service.category}
                              </span>
                            )}
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
                className="w-full mt-8 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black h-12 text-base font-medium transition-colors"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes? This will update your provider profile
              and service availability.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedSave}
              className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
