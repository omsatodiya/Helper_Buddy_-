"use client";

import { useState, useEffect } from 'react';
import { Shield, MapPin, Upload, ArrowLeft, Users, Calendar, Star, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { getCityFromPincode } from "@/lib/utils/pincode";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from 'firebase/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AVAILABLE_SERVICES = [
  "Hair Cutting",
  "Hair Styling",
  "Hair Coloring",
  "Facial",
  "Makeup",
  "Manicure",
  "Pedicure",
  "Waxing",
  "Threading",
  "Massage",
];

interface ProviderData {
  photo: string;
  servicePincodes: Array<{
    pincode: string;
    city?: string;
    state?: string;
  }>;
  services: string[];
}

export default function ProviderDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [providerData, setProviderData] = useState<ProviderData>({
    photo: '',
    servicePincodes: [],
    services: []
  });
  const [pincodeInput, setPincodeInput] = useState('');
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProviderData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const db = getFirestore();
        const providerDoc = await getDoc(doc(db, 'provider-applications', user.uid));
        
        if (providerDoc.exists()) {
          const data = providerDoc.data();
          setProviderData({
            photo: data.photo || '',
            servicePincodes: data.servicePincodes || [],
            services: data.services || []
          });
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
        toast({
          title: "Error",
          description: "Failed to load provider data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderData();
  }, [router, toast]);

  const handlePincodeAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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

      if (providerData.servicePincodes.some(p => p.pincode === pincode)) {
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

        setProviderData(prev => ({
          ...prev,
          servicePincodes: [...prev.servicePincodes, {
            pincode,
            city: data.city,
            state: data.state
          }]
        }));
        setPincodeInput('');
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
    setProviderData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save changes.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    if (providerData.servicePincodes.length === 0) {
      toast({
        title: "Service area required",
        description: "Please add at least one pincode where you can provide services",
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

    setIsSaving(true);
    try {
      const db = getFirestore();
      
      // Update the provider application document
      await updateDoc(doc(db, 'provider-applications', user.uid), {
        servicePincodes: providerData.servicePincodes,
        services: providerData.services,
        updatedAt: new Date()
      });

      toast({
        title: "Changes saved",
        description: "Your provider profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving changes:', error);
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
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
            <Card className="p-6 border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">Today's Bookings</p>
                  <p className="text-2xl font-semibold">0</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">Total Customers</p>
                  <p className="text-2xl font-semibold">0</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">Average Rating</p>
                  <p className="text-2xl font-semibold">0.0</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">Service Areas</p>
                  <p className="text-2xl font-semibold">{providerData.servicePincodes.length}</p>
                </div>
              </div>
            </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Service Areas */}
                <div>
                  <Label className="text-sm mb-2 block">Service Areas</Label>
                  <Input
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    onKeyDown={handlePincodeAdd}
                    placeholder="Enter pincode and press Enter"
                    maxLength={6}
                    disabled={isValidatingPincode}
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {providerData.servicePincodes.map(({ pincode, city }) => (
                      <div
                        key={pincode}
                        className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-sm flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{pincode}</span>
                        {city && <span className="text-black/60 dark:text-white/60">({city})</span>}
                        <button
                          onClick={() => setProviderData(prev => ({
                            ...prev,
                            servicePincodes: prev.servicePincodes.filter(p => p.pincode !== pincode)
                          }))}
                          className="hover:text-black dark:hover:text-white ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <Label className="text-sm mb-2 block">Your Services</Label>
                  <div className="space-y-2">
                    {AVAILABLE_SERVICES.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={providerData.services.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label htmlFor={service} className="text-sm">
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="w-full mt-8 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
} 