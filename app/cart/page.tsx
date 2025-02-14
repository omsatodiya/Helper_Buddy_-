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
import {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
} from "@/lib/firebase/cart";
import { getAddresses } from "@/lib/firebase/address";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  serviceProvider?: string;
}

interface Address {
  id: string;
  label: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const items = await getCartItems(user.uid);
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // Add useEffect to fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const userAddresses = await getAddresses(user.uid);
        setAddresses(userAddresses);
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

        toast({
          title: "Location Found",
          description: "Your address has been automatically set",
        });
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
      toast({
        title: "Error",
        description: "Failed to get address details from your location",
        variant: "destructive",
      });
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
      // Optimistically update UI
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      // Update in database
      const success = await updateCartItemQuantity(
        user.uid,
        itemId,
        newQuantity
      );

      if (!success) {
        // Revert on failure
        await fetchCartItems();
        throw new Error("Failed to update quantity");
      }
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
      // Optimistically remove from UI
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));

      // Remove from database
      const success = await removeFromCart(user.uid, itemId);

      if (!success) {
        // Revert on failure
        await fetchCartItems();
        throw new Error("Failed to remove item");
      }

      toast({
        title: "Success",
        description: "Item removed from cart",
      });
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white dark:bg-black mt-24">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
              Shopping Cart
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Cart Items Loading Skeleton */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-full">
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>

                {/* Multiple Cart Item Skeletons */}
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-6 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="flex-1 space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary Loading Skeleton */}
              <div className="lg:col-span-4">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-6" />
                  </div>
                </div>
              </div>
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
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            Your cart is empty
          </h1>
          <p className="text-gray-600 dark:text-white/70">
            Add some services to get started
          </p>
          <Button
            onClick={() => (window.location.href = "/services")}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
          >
            Browse Services
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white mt-24 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items and Address Selection */}
            <div className="lg:col-span-8 space-y-6">
              {/* Address Selection - Updated UI */}
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-gray-500" />
                  <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4">
                      Delivery Address
                    </h2>

                    {isLoadingLocation ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ) : selectedAddress ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p className="font-medium">{selectedAddress.label}</p>
                          <p>{selectedAddress.address}</p>
                          <p>
                            {selectedAddress.city}, {selectedAddress.state} -{" "}
                            {selectedAddress.pincode}
                          </p>
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
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                          No address selected
                        </p>
                        <Button
                          variant="secondary"
                          className="w-full py-6 text-primary"
                          onClick={() => setShowAddressModal(true)}
                        >
                          Select an address
                        </Button>
                      </div>
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          open={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={(address) => {
            setSelectedAddress(address);
            setShowAddressModal(false);
          }}
          onAddAddress={(updatedAddresses: Address[]) => {
            setAddresses(updatedAddresses);
          }}
        />
      )}
    </>
  );
}
