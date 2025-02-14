import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Navigation,
  Loader2,
  Home,
  Building2,
  Plus,
  Pencil,
  Trash,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { saveAddress, deleteAddress } from "@/lib/firebase/address";
import { useAuth } from "@/hooks/useAuth";

interface Address {
  id: string;
  label: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address | null) => void;
  onAddAddress: (updatedAddresses: Address[]) => void;
}

// Predefined locations
const locations = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    addresses: [
      "Andheri East, Mumbai",
      "Bandra West, Mumbai",
      "Powai, Mumbai",
      "Thane West",
    ],
  },
  {
    id: "work",
    label: "Work",
    icon: Building2,
    addresses: [
      "BKC, Mumbai",
      "Lower Parel, Mumbai",
      "Worli, Mumbai",
      "Vashi, Navi Mumbai",
    ],
  },
];

export function AddressModal({
  open,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddAddress,
}: AddressModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to add addresses",
        variant: "destructive",
      });
      return;
    }

    if (
      !newAddress.label ||
      !newAddress.address ||
      !newAddress.pincode ||
      !newAddress.city ||
      !newAddress.state
    ) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const addressToSave: Address = {
        id: editingAddress ? editingAddress.id : Date.now().toString(),
        label: newAddress.label!,
        address: newAddress.address!,
        pincode: newAddress.pincode!,
        city: newAddress.city!,
        state: newAddress.state!,
      };

      await saveAddress(user.uid, addressToSave);

      const updatedAddresses = editingAddress
        ? addresses.map((addr) =>
            addr.id === editingAddress.id ? addressToSave : addr
          )
        : [...addresses, addressToSave];

      onAddAddress(updatedAddresses);
      setShowAddForm(false);
      setEditingAddress(null);
      setNewAddress({
        label: "",
        address: "",
        pincode: "",
        city: "",
        state: "",
      });

      toast({
        title: "Success",
        description: editingAddress
          ? "Address updated successfully"
          : "Address added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!user) return;

    try {
      await deleteAddress(user.uid, addressId);
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );

      if (selectedAddress?.id === addressId) {
        onSelectAddress(null);
      }

      onAddAddress(updatedAddresses);

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const fetchAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&language=en`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;

        // Create a new address from the location data
        const locationAddress: Address = {
          id: Date.now().toString(), // Generate unique ID
          label: "Current Location",
          address: components.road
            ? `${components.road}${
                components.house_number ? `, ${components.house_number}` : ""
              }`
            : result.formatted.split(",")[0],
          pincode: components.postcode || "",
          city:
            components.city ||
            components.town ||
            components.state_district ||
            "",
          state: components.state || "",
        };

        // Save this address to the user's addresses
        if (user) {
          await saveAddress(user.uid, locationAddress);
          onAddAddress([...addresses, locationAddress]);
          onSelectAddress(locationAddress);
        }

        toast({
          title: "Location Found",
          description: "Your current location has been added to your addresses",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast({
        title: "Error",
        description:
          "Failed to get address from location. Please try adding manually.",
        variant: "destructive",
      });
    }
  };

  const getCurrentLocation = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to add addresses",
        variant: "destructive",
      });
      return;
    }

    if (!("geolocation" in navigator)) {
      toast({
        title: "Error",
        description: "Location services not available in your browser",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      await fetchAddressFromCoordinates(
        position.coords.latitude,
        position.coords.longitude
      );
    } catch (error: any) {
      console.error("Error getting location:", error);

      // Show specific toast message based on the error
      if (error.code === 1) {
        // PERMISSION_DENIED
        toast({
          title: "Location Access Denied",
          description:
            "Please enable location access in your browser settings to use this feature. Click the location icon in your address bar and select 'Allow'.",
          variant: "destructive",
        });
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE
        toast({
          title: "Location Unavailable",
          description:
            "Unable to detect your location. Please check if your device's location service is enabled.",
          variant: "destructive",
        });
      } else if (error.code === 3) {
        // TIMEOUT
        toast({
          title: "Request Timeout",
          description:
            "Location request timed out. Please try again or add address manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Location Error",
          description:
            "Failed to get your location. Please try again or add address manually.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {showAddForm
              ? editingAddress
                ? "Edit Address"
                : "Add New Address"
              : "Select Delivery Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!showAddForm ? (
            <>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                Use Current Location
              </Button>

              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedAddress?.id === address.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span className="font-medium">{address.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => onSelectAddress(address)}
                  >
                    <p className="text-sm text-gray-600">{address.address}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Address Label</Label>
                <Input
                  id="label"
                  placeholder="Home, Work, etc."
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                    setNewAddress({
                      label: "",
                      address: "",
                      pincode: "",
                      city: "",
                      state: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAddress ? "Save Changes" : "Add Address"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
