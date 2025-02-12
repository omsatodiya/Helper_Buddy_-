'use client';

import { useState } from 'react';
import { Shield, Star, Award, CheckCircle2, ArrowRight, Upload, MapPin, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCityFromPincode } from "@/lib/utils/pincode";

interface ProviderFormData {
  photo: File | null;
  photoURL: string | null;
  pincodes: Array<{
    pincode: string;
    city?: string;
    state?: string;
  }>;
  services: string[];
}

interface ProviderApplication {
  userId: string;
  userName: string;
  email: string;
  photo: string;
  servicePincodes: Array<{
    pincode: string;
    city?: string;
    state?: string;
  }>;
  services: string[];
  status: 'pending' | 'approved' | 'rejected';
  applicationDate: Date;
  reviewDate?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

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
  // Add more services as needed
];

// First, let's extract the ProviderForm into a separate component
const ProviderForm = ({
  showForm,
  setShowForm,
  formData,
  setFormData,
  pincodeInput,
  setPincodeInput,
  isValidatingPincode,
  handlePhotoUpload,
  handlePincodeAdd,
  handleServiceToggle,
  handleBecomeProvider,
  isSubmitting
}: {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  formData: ProviderFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>;
  pincodeInput: string;
  setPincodeInput: (value: string) => void;
  isValidatingPincode: boolean;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePincodeAdd: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleServiceToggle: (service: string) => void;
  handleBecomeProvider: () => Promise<void>;
  isSubmitting: boolean;
}) => (
  <Dialog 
    open={showForm} 
    onOpenChange={(open) => {
      if (!open) setShowForm(false);
    }}
  >
    <DialogContent className="max-w-3xl h-auto max-h-[95vh] flex flex-col bg-white dark:bg-black border border-black/10 dark:border-white/10">
      <DialogHeader className="pb-2">
        <DialogTitle className="text-black dark:text-white">Provider Application Form</DialogTitle>
      </DialogHeader>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Photo Upload Section - Compact */}
          <div>
            <Label className="text-sm">Upload Your Photo</Label>
            {formData.photo ? (
              <div className="relative h-[150px] w-[150px] mx-auto mt-2 rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden">
                <img
                  src={URL.createObjectURL(formData.photo)}
                  alt="Provider photo"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-[150px] w-[150px] mx-auto mt-2 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <Upload className="h-8 w-8 text-black/40 dark:text-white/40" />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mt-2"
            />
          </div>

          {/* Service Area Section */}
          <div>
            <Label className="text-sm">Service Area Pincodes</Label>
            <Input
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
              onKeyDown={handlePincodeAdd}
              placeholder="Enter pincode and press Enter"
              maxLength={6}
              disabled={isValidatingPincode}
              className="mt-1"
            />
            <div className="flex flex-wrap gap-1 mt-2 max-h-[100px] overflow-y-auto">
              {formData.pincodes.map(({ pincode, city, state }) => (
                <div
                  key={pincode}
                  className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full text-xs flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{pincode}</span>
                  {city && <span className="text-black/60 dark:text-white/60">({city})</span>}
                  <button
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      pincodes: prev.pincodes.filter(p => p.pincode !== pincode)
                    }))}
                    className="hover:text-black dark:hover:text-white ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Services Checklist */}
          <div>
            <Label className="text-sm">Available Services</Label>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {AVAILABLE_SERVICES.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={formData.services.includes(service)}
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
      </div>

      <Button
        onClick={handleBecomeProvider}
        disabled={isSubmitting}
        className="w-full mt-4 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
      >
        {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
      </Button>
    </DialogContent>
  </Dialog>
);

export default function BecomeProviderPage() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProviderFormData>({
    photo: null,
    photoURL: null,
    pincodes: [],
    services: [],
  });
  const [pincodeInput, setPincodeInput] = useState('');
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        photo: e.target.files![0]
      }));
    }
  };

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

      if (formData.pincodes.some(p => p.pincode === pincode)) {
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

        setFormData(prev => ({
          ...prev,
          pincodes: [...prev.pincodes, {
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
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'service_providers');
      formData.append('folder', 'service_providers'); // This will create a folder in Cloudinary

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleBecomeProvider = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to become a provider.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    if (!formData.photo) {
      toast({
        title: "Photo required",
        description: "Please upload your photo",
        variant: "destructive",
      });
      return;
    }

    if (formData.pincodes.length === 0) {
      toast({
        title: "Service area required",
        description: "Please add at least one pincode where you can provide services",
        variant: "destructive",
      });
      return;
    }

    if (formData.services.length === 0) {
      toast({
        title: "Services required",
        description: "Please select at least one service you can provide",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photo to Cloudinary
      const photoURL = await uploadToCloudinary(formData.photo);

      const db = getFirestore();
      
      // Create a new provider application document
      const applicationData: ProviderApplication = {
        userId: user.uid,
        userName: user.displayName || '',
        email: user.email || '',
        photo: photoURL,
        servicePincodes: formData.pincodes,
        services: formData.services,
        status: 'pending',
        applicationDate: new Date(),
      };

      // Add the application to a separate collection for admin review
      await setDoc(doc(db, 'provider-applications', user.uid), applicationData);

      // Update user document to show they have a pending application
      await updateDoc(doc(db, 'users', user.uid), {
        hasProviderApplication: true,
        applicationStatus: 'pending',
        applicationDate: new Date()
      });

      toast({
        title: "Application submitted!",
        description: "Your application is under review. We'll notify you once it's approved.",
      });
      
    } catch (error) {
      console.error('Error submitting provider application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: "Verified Provider Status",
      description: "Join our network of trusted professionals and build credibility with a verified provider badge."
    },
    {
      icon: Star,
      title: "Increased Visibility",
      description: "Get featured in our provider directory and reach more potential clients."
    },
    {
      icon: Award,
      title: "Professional Tools",
      description: "Access exclusive tools and features to manage your services efficiently."
    }
  ];

  const requirements = [
    "Valid professional certification or license",
    "Minimum 2 years of experience",
    "Excellent communication skills",
    "Strong portfolio or work history",
    "Commitment to quality service"
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="pt-32 pb-20 border-b border-black/10 dark:border-white/10">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">
              Become a Service Provider
            </h1>
            <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed mb-8">
              Join our platform and start offering your professional services to clients worldwide.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="h-12 px-8 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black font-medium"
            >
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-black dark:text-white">
            Benefits of Becoming a Provider
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={index}
                className="relative border border-black/10 dark:border-white/10 bg-white dark:bg-black hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="p-8">
                  <div className="h-12 w-12 rounded-lg bg-black dark:bg-white flex items-center justify-center mb-6">
                    <benefit.icon className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-black/60 dark:text-white/60 text-base leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-black dark:text-white">
            Requirements
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {requirements.map((requirement, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-white dark:bg-black border border-black/10 dark:border-white/10"
                >
                  <CheckCircle2 className="h-6 w-6 text-black dark:text-white shrink-0" />
                  <span className="text-black/80 dark:text-white/80">
                    {requirement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Render the form modal with props */}
      <ProviderForm
        showForm={showForm}
        setShowForm={setShowForm}
        formData={formData}
        setFormData={setFormData}
        pincodeInput={pincodeInput}
        setPincodeInput={setPincodeInput}
        isValidatingPincode={isValidatingPincode}
        handlePhotoUpload={handlePhotoUpload}
        handlePincodeAdd={handlePincodeAdd}
        handleServiceToggle={handleServiceToggle}
        handleBecomeProvider={handleBecomeProvider}
        isSubmitting={isSubmitting}
      />
    </main>
  );
} 