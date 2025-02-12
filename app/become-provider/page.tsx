'use client';

import { useState, useEffect } from 'react';
import { Shield, Star, Award, CheckCircle2, ArrowRight, Upload, MapPin, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCityFromPincode } from "@/lib/utils/pincode";
import Preloader from "@/components/ui/preloader";

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

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

// Add these helper functions at the top with other constants
const validatePhotoSize = (file: File): { valid: boolean; error?: string } => {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > 2) {
    return {
      valid: false,
      error: `Image size (${sizeMB.toFixed(1)} MB) is too large. Please upload an image under 2 MB.`
    };
  }
  return { valid: true };
};

const validatePhotoType = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    const fileType = file.type.split('/')[1].toUpperCase();
    return {
      valid: false,
      error: `${fileType} files are not supported. Please upload a JPG or PNG image.`
    };
  }
  return { valid: true };
};

// Add this new function to validate image dimensions
const validateImageDimensions = (file: File): Promise<{ valid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const aspectRatio = img.width / img.height;
      
      if (Math.abs(aspectRatio - 1) > 0.1) { // Allow small deviation from perfect square
        resolve({
          valid: false,
          error: 'Please upload a square (1:1) image'
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: 'Failed to load image. Please try another file.'
      });
    };

    img.src = objectUrl;
  });
};

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
  isSubmitting,
  termsAccepted,
  setTermsAccepted,
  previewUrl,
  hasSubmitted,
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
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  previewUrl: string | null;
  hasSubmitted: boolean;
}) => (
  <Dialog 
    open={showForm && !hasSubmitted}
    onOpenChange={(open) => {
      if (!open || hasSubmitted) setShowForm(false);
    }}
  >
    <DialogContent className="max-w-3xl h-[90vh] flex flex-col bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10">
      {hasSubmitted ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
            Application Submitted
          </h2>
          <p className="text-black/60 dark:text-white/60 mb-6">
            Your application is currently under review. We'll notify you once it's processed.
          </p>
          <Button
            onClick={() => setShowForm(false)}
            className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
          >
            Close
          </Button>
        </div>
      ) : (
        <>
          <DialogHeader className="pb-4 flex-shrink-0">
            <DialogTitle className="text-2xl font-semibold text-black dark:text-white">Provider Application</DialogTitle>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              Complete the form below to join our network of professional service providers.
            </p>
          </DialogHeader>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
            {/* Left Column */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Profile Photo</Label>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Upload a professional photo of yourself
                  </p>
                  <ul className="text-xs text-black/40 dark:text-white/40 list-disc ml-4 space-y-0.5">
                    <li>Must be a square image (1:1 ratio)</li>
                    <li>Maximum file size: 2MB</li>
                    <li>Accepted formats: JPG, PNG</li>
                  </ul>
                </div>
                <div className="relative group">
                  <label 
                    htmlFor="photo-upload"
                    className="block w-40 aspect-square mx-auto cursor-pointer"
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Provider photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm">Click to change photo</p>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {((formData.photo?.size ?? 0) / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center border-2 border-dashed border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 transition-colors">
                        <Upload className="h-8 w-8 text-black/40 dark:text-white/40 mb-2" />
                        <p className="text-sm text-black/60 dark:text-white/60">
                          Click to upload photo
                        </p>
                      </div>
                    )}
                  </label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Service Area Section */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Service Areas</Label>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Add the pincodes where you can provide services
                </p>
                <div className="relative">
                  <Input
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    onKeyDown={handlePincodeAdd}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    disabled={isValidatingPincode}
                    className="pr-24 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-inset"
                  />
                  {isValidatingPincode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <p className="text-sm text-black/60 dark:text-white/60 animate-pulse">
                        Validating...
                      </p>
                    </div>
                  )}
                </div>
                {formData.pincodes.length > 0 && (
                  <div className="bg-black/5 dark:bg-white/5 rounded-lg">
                    <div className="p-2 max-h-[120px] overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {formData.pincodes.map(({ pincode, city, state }) => (
                          <div
                            key={pincode}
                            className="px-3 py-1.5 bg-white dark:bg-black rounded-full text-sm flex items-center gap-2 border border-black/10 dark:border-white/10"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>{pincode}</span>
                            {city && <span className="text-black/60 dark:text-white/60">({city})</span>}
                            <button
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                pincodes: prev.pincodes.filter(p => p.pincode !== pincode)
                              }))}
                              className="hover:text-red-500 transition-colors ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {/* Services Selection */}
              <div className="space-y-2 flex-1">
                <Label className="text-base font-medium">Services Offered</Label>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Select the services you can provide
                </p>
                <div className="grid grid-cols-1 gap-2 mt-2 h-[280px] overflow-y-auto p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  {AVAILABLE_SERVICES.map((service) => (
                    <label 
                      key={service}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                        ${formData.services.includes(service) 
                          ? 'bg-black dark:bg-white text-white dark:text-black' 
                          : 'bg-white dark:bg-black hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                      <Checkbox
                        checked={formData.services.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                        className="data-[state=checked]:bg-transparent"
                      />
                      <span className="flex-1">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <div className="flex items-start gap-2 mb-4">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label 
                htmlFor="terms" 
                className="text-sm text-black/60 dark:text-white/60 cursor-pointer"
              >
                I agree to the terms and conditions and confirm that all provided information is accurate
              </label>
            </div>

            <Button
              onClick={handleBecomeProvider}
              disabled={isSubmitting || formData.services.length === 0 || formData.pincodes.length === 0 || !formData.photo || !termsAccepted}
              className="w-full h-12 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                  Submitting Application...
                </div>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);

export default function BecomeProviderPage() {
  // Remove redundant loading states
  const [loading, setLoading] = useState(true);
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Single effect to handle loading
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const [applicationDoc, userDoc] = await Promise.all([
            getDoc(doc(db, 'provider-applications', user.uid)),
            getDoc(doc(db, 'users', user.uid))
          ]);
          
          if (applicationDoc.exists() || (userDoc.exists() && userDoc.data()?.hasProviderApplication)) {
            setHasSubmitted(true);
            setShowForm(false);
            toast({
              title: "Existing Application",
              description: "You have already submitted an application. Please wait for admin review.",
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      } finally {
        // Set loading to false after status check
        setTimeout(() => setLoading(false), 2000);
      }
    };

    checkApplicationStatus();

    // Hide footer during loading
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }

    return () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, [toast]);

  // Update footer visibility based on loading state
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      if (!loading) {
        setTimeout(() => {
          footer.style.display = 'block';
        }, 300);
      }
    }
  }, [loading]);

  // All other functions (handlePhotoUpload, handlePincodeAdd, etc.) go here...

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Clean up previous preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Validate file type
      const typeValidation = validatePhotoType(file);
      if (!typeValidation.valid) {
        toast({
          title: "Wrong File Type",
          description: typeValidation.error,
          variant: "destructive",
        });
        return;
      }

      // Validate file size
      const fileSize = file.size / (1024 * 1024); // Convert to MB
      if (fileSize > 2) {
        toast({
          title: "File Too Large",
          description: `Your image is ${fileSize.toFixed(1)} MB. Please upload an image smaller than 2 MB.`,
          variant: "destructive",
        });
        return;
      }

      // Create preview URL
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);

      // If all validations pass, update the form data
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the image. Please try another file.",
        variant: "destructive",
      });
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
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      // Create form data
      const formData = new FormData();
      
      // Add upload parameters for 1:1 crop
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'service_providers');
      formData.append('folder', 'service_providers');
      formData.append('public_id', `provider_${user.uid}`); // Use user ID in filename
      formData.append('crop', 'fill');
      formData.append('aspect_ratio', '1.0');
      formData.append('width', '800'); // Set desired width
      formData.append('height', '800'); // Set desired height
      formData.append('file', file);

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

    try {
      // Check application status first
      const db = getFirestore();
      const [applicationDoc, userDoc] = await Promise.all([
        getDoc(doc(db, 'provider-applications', user.uid)),
        getDoc(doc(db, 'users', user.uid))
      ]);

      if (applicationDoc.exists() || (userDoc.exists() && userDoc.data()?.hasProviderApplication)) {
        setHasSubmitted(true);
        setShowForm(false);
        toast({
          title: "Application Already Exists",
          description: "You have already submitted an application. Please wait for admin review.",
          variant: "default",
        });
        return;
      }

      if (hasSubmitted) {
        toast({
          title: "Application Already Submitted",
          description: "Your application is currently under review. We'll notify you once it's processed.",
          variant: "default",
        });
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

        // After successful submission
        setHasSubmitted(true);
        toast({
          title: "Application submitted!",
          description: "Your application is under review. We'll notify you once it's approved.",
        });
        
        // Optional: Close the form after successful submission
        setShowForm(false);
        
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
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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

  return (
    <>
      {loading && <Preloader onLoadingComplete={() => setLoading(false)} />}
      <main className={`min-h-screen bg-white dark:bg-black transition-opacity duration-300 ${
        loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Hero Section */}
        <section className="relative h-[600px] bg-[#0A0A0A] dark:bg-white flex items-center">
          <div className="absolute inset-0 bg-white/5 dark:bg-black/5" />
          <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6 text-white dark:text-black">
                Turn Your Skills into Success
              </h1>
              <p className="text-xl text-white/80 dark:text-black/80 leading-relaxed mb-8 max-w-2xl">
                Join our growing network of professional service providers and connect with clients looking for your expertise. Start your journey to success today.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowForm(true)}
                  disabled={hasSubmitted}
                  className="h-14 px-8 bg-white hover:bg-white/90 text-[#0A0A0A] dark:bg-black dark:hover:bg-black/90 dark:text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {hasSubmitted ? 'Application Pending' : 'Apply Now'}
                  {!hasSubmitted && <ArrowRight className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  className="h-14 px-8 border-2 border-white/80 bg-transparent hover:bg-white/10 text-white hover:text-white dark:border-black/80 dark:bg-transparent dark:hover:bg-black/10 dark:text-black dark:hover:text-black font-medium rounded-lg transition-all"
                  onClick={() => window.scrollTo({ top: document.getElementById('benefits')?.offsetTop, behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white dark:bg-[#0A0A0A] border-b border-black/10 dark:border-white/10">
          <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: '500+', label: 'Active Providers' },
                { number: '10K+', label: 'Happy Customers' },
                { number: '95%', label: 'Satisfaction Rate' },
                { number: '24/7', label: 'Support Available' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-black dark:text-white mb-2">{stat.number}</div>
                  <div className="text-black/60 dark:text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24 bg-black/[0.02] dark:bg-[#0A0A0A]">
          <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-4 text-black dark:text-white">
                Why Choose Us?
              </h2>
              <p className="text-lg text-black/60 dark:text-white/60">
                Join our platform and unlock a world of opportunities to grow your business
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card 
                  key={index}
                  className="group relative border border-black/10 dark:border-white/10 bg-white dark:bg-[#111] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="h-14 w-14 rounded-xl bg-black dark:bg-white group-hover:scale-110 transition-transform duration-300 flex items-center justify-center mb-6">
                      <benefit.icon className="h-7 w-7 text-white dark:text-black" />
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

        {/* How It Works Section */}
        <section className="py-24 bg-[#0A0A0A] dark:bg-white">
          <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white dark:text-black">
                How It Works
              </h2>
              <p className="text-lg text-white/80 dark:text-black/80">
                Get started in just a few simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  number: '01',
                  title: 'Create Profile',
                  description: 'Fill out your professional details and upload required documents'
                },
                {
                  number: '02',
                  title: 'Set Services',
                  description: 'Define your service areas and the services you offer'
                },
                {
                  number: '03',
                  title: 'Get Verified',
                  description: 'Our team reviews and verifies your application'
                },
                {
                  number: '04',
                  title: 'Start Earning',
                  description: 'Accept bookings and start providing services'
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="mb-6">
                    <span className="text-[32px] font-bold text-white/20 dark:text-black/20">
                      {item.number}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white dark:text-black">
                      {item.title}
                    </h3>
                    <p className="text-white/80 dark:text-black/80">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
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
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          previewUrl={previewUrl}
          hasSubmitted={hasSubmitted}
        />
      </main>
    </>
  );
} 