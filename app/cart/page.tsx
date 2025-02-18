"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CartItemCard from "@/components/cart/CartItemCard";
import CartSummary from "@/components/cart/CartSummary";
import { MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AddressModal } from "@/components/address/AddressModal";
import Link from "next/link";
import {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
} from "@/lib/firebase/cart";
import { getAddresses } from "@/lib/firebase/address";
import { CartItem } from "@/types/cart";
import { sendProviderNotifications } from "@/lib/email";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import emailjs from "@emailjs/browser";

interface Address {
  id: string;
  label: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  deliveryDate?: string;
  deliveryTime?: string;
  remarks?: string;
}

interface LocationDetails {
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  formatted?: string;
}

interface ServiceProvider {
  id: string;
  email: string;
  name: string;
  location?: {
    city?: string;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [addressFromLocation, setAddressFromLocation] = useState<string>("");
  const [locationDetails, setLocationDetails] =
    useState<LocationDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const router = useRouter();
  const [dateTimeError, setDateTimeError] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const items = await getCartItems(user.uid);
      setCartItems(items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const userAddresses = await getAddresses(user.uid);
        setAddresses(userAddresses);
        if (userAddresses.length > 0) {
          setSelectedAddress(userAddresses[0]);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast({
          title: "Error",
          description: "Failed to load addresses",
          variant: "destructive",
        });
      }
    };

    fetchAddresses();
  }, [user]);

  const fetchAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    setIsLoadingLocation(true);
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&language=en`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;

        const details: LocationDetails = {
          street: components.road || components.street,
          area:
            components.suburb ||
            components.neighbourhood ||
            components.district,
          city: components.city || components.town,
          state: components.state,
          country: components.country,
          postcode: components.postcode,
          formatted: result.formatted,
        };

        setLocationDetails(details);

        // Create a formatted address string
        const formattedAddress = `${details.street || ""}, ${
          details.area || ""
        }, ${details.city || ""}, ${details.state || ""} ${
          details.postcode || ""
        }`
          .replace(/^,\s+/, "")
          .replace(/,\s+,/g, ",");

        setSelectedAddress({
          id: formattedAddress,
          label: "Home",
          address: formattedAddress,
          pincode: "400001",
          city: "Mumbai",
          state: "Maharashtra",
        });
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
      setLocationError("Failed to get address details from your location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Get user's location when component mounts
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          await fetchAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(
            "Failed to get your location. Please enter address manually."
          );
          toast({
            title: "Location Error",
            description:
              "Failed to get your location. Please enter address manually.",
            variant: "destructive",
          });
        }
      );
    }
  }, []);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user || isUpdating) return;
    setIsUpdating(true);

    try {
      await updateCartItemQuantity(user.uid, itemId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user || isUpdating) return;
    setIsUpdating(true);

    try {
      await removeFromCart(user.uid, itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotifyProviders = async () => {
    if (!selectedAddress || !user) return;

    try {
      setIsSendingEmails(true);

      const providersRef = collection(db, "providers");
      const providersSnapshot = await getDocs(providersRef);

      // Find all providers with matching pincode
      const providers: ServiceProvider[] = [];
      providersSnapshot.forEach((doc) => {
        const data = doc.data();
        const hasMatchingPincode = data.servicePincodes?.some(
          (p: any) => p.pincode === selectedAddress.pincode
        );

        // Check if provider offers all requested services
        const hasMatchingServices = cartItems.every((cartItem) =>
          data.services?.includes(cartItem.name)
        );

        if (hasMatchingPincode && hasMatchingServices) {
          providers.push({ id: doc.id, ...data } as ServiceProvider);
        }
      });

      if (providers.length === 0) {
        toast({
          title: "No Providers Found",
          description:
            "Currently there are no service providers in your pincode area.",
          variant: "destructive",
        });
        return;
      }

      // Create service requests for each provider
      await Promise.all(
        providers.map(async (provider) => {
          // Create service request document
          const requestRef = doc(collection(db, "serviceRequests"));
          await setDoc(requestRef, {
            id: requestRef.id,
            providerId: provider.id,
            customerName: user.displayName,
            customerEmail: user.email,
            customerAddress: selectedAddress.address,
            customerPincode: selectedAddress.pincode,
            customerCity: selectedAddress.city,
            items: cartItems,
            status: "pending",
            createdAt: new Date(),
          });

          // Send email notification
          return sendProviderNotifications({
            providerEmail: provider.email,
            providerName: provider.name,
            customerName: user.displayName || "Customer",
            customerEmail: user.email || "",
            customerAddress: selectedAddress.address,
            customerPincode: selectedAddress.pincode,
            customerCity: selectedAddress.city,
            items: cartItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          });
        })
      );

      toast({
        title: "Success",
        description: `Notified ${providers.length} service providers in your area.`,
      });
    } catch (error) {
      console.error("Error notifying providers:", error);
      toast({
        title: "Error",
        description: "Failed to notify service providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const validateDateTime = (date: string, time: string): boolean => {
    const selectedDateTime = new Date(`${date} ${time}`);
    const now = new Date();

    // Add 2 hours to current time for minimum delivery time
    const minDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Maximum date is 30 days from now
    const maxDateTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (selectedDateTime < minDateTime) {
      setDateTimeError("Please select a time at least 2 hours from now");
      return false;
    }

    if (selectedDateTime > maxDateTime) {
      setDateTimeError("Please select a date within the next 30 days");
      return false;
    }

    setDateTimeError("");
    return true;
  };

  const handleFindProvider = async () => {
    if (!user || !selectedAddress) {
      toast({
        title: "Error",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAddress.deliveryDate || !selectedAddress.deliveryTime) {
      toast({
        title: "Error",
        description: "Please select delivery date and time",
        variant: "destructive",
      });
      return;
    }

    if (
      !validateDateTime(
        selectedAddress.deliveryDate,
        selectedAddress.deliveryTime
      )
    ) {
      toast({
        title: "Error",
        description: dateTimeError,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingEmails(true);

      // Find providers with matching pincode
      const providersRef = collection(db, "providers");
      const providersSnapshot = await getDocs(providersRef);
      const providers: ServiceProvider[] = [];

      providersSnapshot.forEach((doc) => {
        const data = doc.data();
        const hasMatchingPincode = data.servicePincodes?.some(
          (p: any) => p.pincode === selectedAddress.pincode
        );
        if (hasMatchingPincode) {
          providers.push({ id: doc.id, ...data } as ServiceProvider);
        }
      });

      if (providers.length === 0) {
        toast({
          title: "No Providers Found",
          description:
            "Currently there are no service providers in your pincode area.",
          variant: "destructive",
        });
        return;
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Format service details for email
      const serviceDetails = cartItems
        .map(
          (item) =>
            `${item.name} (Quantity: ${item.quantity}) - ₹${
              item.price * item.quantity
            }`
        )
        .join("<br>");

      // Send emails to all matching providers
      await Promise.all(
        providers.map(async (provider) => {
          try {
            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID_2!,
              process.env
                .NEXT_PUBLIC_EMAILJS_PROVIDER_NOTIFICATION_TEMPLATE_ID!,
              {
                to_email: provider.email,
                to_name: provider.name,
                customer_name: user?.displayName || "Customer",
                customer_location: `${selectedAddress.address}, ${selectedAddress.city} - ${selectedAddress.pincode}`,
                delivery_date: selectedAddress.deliveryDate,
                delivery_time: selectedAddress.deliveryTime,
                service_details: serviceDetails,
                estimated_value: `₹${totalAmount.toLocaleString("en-IN")}`,
                remarks: selectedAddress.remarks || "No additional remarks",
                from_name: "Your Service Platform",
                reply_to: "support@yourplatform.com",
              },
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY_2
            );
          } catch (error) {
            console.error(
              `Failed to send email to provider ${provider.email}:`,
              error
            );
          }
        })
      );

      // Create main service request
      const orderRef = doc(collection(db, "serviceRequests"));
      const serviceRequestData = {
        id: orderRef.id,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
        totalAmount,
        customerName: selectedAddress.label,
        customerEmail: user.email,
        customerAddress: selectedAddress.address,
        customerCity: selectedAddress.city,
        customerPincode: selectedAddress.pincode,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        availableProviders: providers.map((p) => p.id),
        deliveryDate: selectedAddress.deliveryDate,
        deliveryTime: selectedAddress.deliveryTime,
        remarks: selectedAddress.remarks || "",
      };

      // Save main request
      await setDoc(orderRef, serviceRequestData);

      // Create requests for providers
      await Promise.all(
        providers.map(async (provider) => {
          const providerRequestRef = doc(
            collection(db, "providers", provider.id, "serviceRequests")
          );

          await setDoc(providerRequestRef, {
            ...serviceRequestData,
            id: providerRequestRef.id,
            mainRequestId: orderRef.id,
            providerStatus: "pending",
          });
        })
      );

      // Clear cart
      const cartRef = doc(db, "carts", user.uid);
      await deleteDoc(cartRef);

      toast({
        title: "Success",
        description: "Your service request has been submitted successfully",
      });

      router.push("/services/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to submit service request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-black mt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Address Skeleton */}
              <div className="bg-white dark:bg-black border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="w-full">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse" />
                    <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Cart Items Skeleton */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-black border rounded-lg p-6 animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="flex-1">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                      <div className="flex justify-between items-center">
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary Skeleton */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-black border rounded-lg p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                  ))}
                </div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  // Show loading skeleton until initialization
  if (!initialized || loading) {
    return <LoadingSkeleton />;
  }

  // Only show empty cart or login prompt after initialization
  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white dark:bg-black mt-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Please Login</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Login to view your cart and continue shopping
              </p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white dark:bg-black mt-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Browse our services and add items to your cart
              </p>
              <Link href="/services">
                <Button>Browse Services</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-black mt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Address Selection */}
              <div className="bg-white dark:bg-black border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-gray-500" />
                  <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4">
                      Delivery Details
                    </h2>
                    {selectedAddress ? (
                      <div className="space-y-4">
                        <div className="text-sm">
                          <p className="font-medium">{selectedAddress.label}</p>
                          <p>{selectedAddress.address}</p>
                          <p>
                            {selectedAddress.city}, {selectedAddress.state} -{" "}
                            {selectedAddress.pincode}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                Delivery Date
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                      format(date, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => {
                                      setDate(newDate);
                                      if (newDate) {
                                        setSelectedAddress({
                                          ...selectedAddress!,
                                          deliveryDate: format(
                                            newDate,
                                            "yyyy-MM-dd"
                                          ),
                                        });
                                      }
                                    }}
                                    disabled={(date) => {
                                      const now = new Date();
                                      const maxDate = new Date();
                                      maxDate.setDate(maxDate.getDate() + 30);
                                      return date < now || date > maxDate;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                Delivery Time
                              </label>
                              <div className="flex gap-2">
                                <Select
                                  value={
                                    selectedAddress?.deliveryTime?.split(
                                      ":"
                                    )[0] || ""
                                  }
                                  onValueChange={(hour) => {
                                    const currentMins =
                                      selectedAddress?.deliveryTime?.split(
                                        ":"
                                      )[1] || "00";
                                    setSelectedAddress({
                                      ...selectedAddress!,
                                      deliveryTime: `${hour}:${currentMins}`,
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Hour" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => {
                                      const hour = i
                                        .toString()
                                        .padStart(2, "0");
                                      return (
                                        <SelectItem key={hour} value={hour}>
                                          {hour}:00
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={
                                    selectedAddress?.deliveryTime?.split(
                                      ":"
                                    )[1] || ""
                                  }
                                  onValueChange={(minute) => {
                                    const currentHour =
                                      selectedAddress?.deliveryTime?.split(
                                        ":"
                                      )[0] || "00";
                                    setSelectedAddress({
                                      ...selectedAddress!,
                                      deliveryTime: `${currentHour}:${minute}`,
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Minute" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {["00", "15", "30", "45"].map((minute) => (
                                      <SelectItem key={minute} value={minute}>
                                        :{minute}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <Clock className="inline-block w-3 h-3 mr-1" />
                                Select delivery time in 15-minute intervals
                              </p>
                            </div>
                          </div>
                          {dateTimeError && (
                            <p className="text-sm text-red-500">
                              {dateTimeError}
                            </p>
                          )}

                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Additional Remarks
                            </label>
                            <textarea
                              value={selectedAddress.remarks || ""}
                              onChange={(e) => {
                                setSelectedAddress({
                                  ...selectedAddress,
                                  remarks: e.target.value,
                                });
                              }}
                              placeholder="Add any special instructions or notes for the service provider..."
                              className="w-full px-3 py-2 border rounded-md bg-transparent min-h-[100px] resize-y"
                              maxLength={500}
                            />
                            <p className="text-xs text-gray-500">
                              {(selectedAddress.remarks?.length || 0) <= 500
                                ? `${
                                    selectedAddress.remarks?.length || 0
                                  }/500 characters`
                                : "Maximum character limit reached"}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressModal(true)}
                        >
                          Change Address
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Add Address
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <CartSummary
                  items={cartItems}
                  isAddressSelected={!!selectedAddress}
                  hasDateTime={
                    !!(
                      selectedAddress?.deliveryDate &&
                      selectedAddress?.deliveryTime
                    )
                  }
                  onNotifyProviders={handleFindProvider}
                  isSendingEmails={isSendingEmails}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Address Modal */}
      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addresses={addresses}
        selectedAddress={selectedAddress}
        onSelectAddress={setSelectedAddress}
        onAddAddress={setAddresses}
      />
    </>
  );
}
