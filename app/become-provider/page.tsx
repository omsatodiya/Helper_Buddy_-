'use client';

import { useState, useEffect } from 'react';
import { Shield, Star, Award, CheckCircle2, ArrowRight, Upload, MapPin, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, updateDoc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
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
    <DialogContent className="max-w-[95vw] md:max-w-3xl h-[90vh] md:h-[85vh] flex flex-col bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 p-4 md:p-6">
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
            <DialogTitle className="text-xl md:text-2xl font-semibold text-black dark:text-white">
              Provider Application
            </DialogTitle>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              Complete the form below to join our network of professional service providers.
            </p>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-6 min-h-0 overflow-y-auto">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              {/* Photo Upload Section - make image preview responsive */}
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
                    className="block w-32 md:w-40 aspect-square mx-auto cursor-pointer"
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

              {/* Service Area Section - adjust pincode tag sizing */}
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
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {formData.pincodes.map(({ pincode, city, state }) => (
                          <div
                            key={pincode}
                            className="px-2 md:px-3 py-1 md:py-1.5 bg-white dark:bg-black rounded-full text-xs md:text-sm flex items-center gap-1.5 md:gap-2 border border-black/10 dark:border-white/10"
                          >
                            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{pincode}</span>
                            {city && <span className="text-black/60 dark:text-white/60 hidden sm:inline">({city})</span>}
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

            {/* Right Column - adjust service selection grid */}
            <div className="flex flex-col gap-4">
              <div className="space-y-2 flex-1">
                <Label className="text-base font-medium">Services Offered</Label>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Select the services you can provide
                </p>
                <div className="grid grid-cols-1 gap-1.5 md:gap-2 mt-2 h-[240px] md:h-[280px] overflow-y-auto p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  {AVAILABLE_SERVICES.map((service) => (
                    <label 
                      key={service}
                      className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg cursor-pointer transition-all text-sm md:text-base
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
                className="text-xs md:text-sm text-black/60 dark:text-white/60 cursor-pointer"
              >
                I agree to the terms and conditions and confirm that all provided information is accurate
              </label>
            </div>

            <Button
              onClick={handleBecomeProvider}
              disabled={isSubmitting || formData.services.length === 0 || formData.pincodes.length === 0 || !formData.photo || !termsAccepted}
              className="w-full h-10 md:h-12 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black font-medium text-sm md:text-base"
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

// Update the HeroPattern component for black/white only
const HeroPattern = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent dark:from-white/20" />
  </div>
);

export default function BecomeProviderPage() {
  // Update loading state to track both initial load and application check
  const [loading, setLoading] = useState(true);
  const [applicationChecked, setApplicationChecked] = useState(false);
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

  // Update the effect to handle auth state properly
  useEffect(() => {
    let isSubscribed = true; // For cleanup
    
    const checkApplicationStatus = async (user: any) => {
      try {
        if (!user) {
          if (isSubscribed) {
            setApplicationChecked(true);
            setHasSubmitted(false);
          }
          return;
        }

        const db = getFirestore();
        const [applicationDoc, userDoc] = await Promise.all([
          getDoc(doc(db, 'provider-applications', user.uid)),
          getDoc(doc(db, 'users', user.uid))
        ]);
        
        if (!isSubscribed) return;

        const hasExistingApplication = applicationDoc.exists() || 
          (userDoc.exists() && userDoc.data()?.hasProviderApplication);
        
        setHasSubmitted(hasExistingApplication);
        
        if (hasExistingApplication) {
          setShowForm(false);
          toast({
            title: "Existing Application",
            description: "You have already submitted an application. Please wait for admin review.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error checking application status:', error);
        if (isSubscribed) {
          setHasSubmitted(false);
        }
      } finally {
        if (isSubscribed) {
          setApplicationChecked(true);
        }
      }
    };

    // Hide footer during loading
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }

    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      await checkApplicationStatus(user);
      if (isSubscribed) {
        setTimeout(() => setLoading(false), 1000);
      }
    });

    // Cleanup function
    return () => {
      isSubscribed = false;
      unsubscribe();
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, [toast]); // Only depend on toast

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

    // Validate form data
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
      const db = getFirestore();

      // Check for existing application first
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

      // Upload photo to Cloudinary
      const formDataForUpload = new FormData();
      formDataForUpload.append('file', formData.photo);
      formDataForUpload.append('upload_preset', 'service_providers');
      formDataForUpload.append('folder', 'provider-photos');

      // Sanitize email for use as filename (replace @ and . with underscores)
      const sanitizedEmail = user.email?.replace(/[@.]/g, '_') || user.uid;
      formDataForUpload.append('public_id', sanitizedEmail);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataForUpload
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const photoURL = uploadData.secure_url;

      // Create application document
      const applicationData = {
        userId: user.uid,
        userName: user.displayName || '',
        email: user.email || '',
        photo: `provider-photos/${sanitizedEmail}`,
        servicePincodes: formData.pincodes,
        services: formData.services,
        status: 'pending',
        applicationDate: new Date(),
        lastUpdated: new Date()
      };

      // Batch write to both collections
      const batch = writeBatch(db);
      
      // Add application to provider-applications collection
      batch.set(doc(db, 'provider-applications', user.uid), applicationData);
      
      // Update user document
      batch.update(doc(db, 'users', user.uid), {
        hasProviderApplication: true,
        applicationStatus: 'pending',
        applicationDate: new Date(),
        lastUpdated: new Date()
      });

      // Commit the batch
      await batch.commit();

      // Success handling
      setHasSubmitted(true);
      toast({
        title: "Application submitted successfully!",
        description: "We'll review your application and get back to you soon.",
      });
      setShowForm(false);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
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

  return (
    <>
      {loading && <Preloader onLoadingComplete={() => setLoading(false)} />}
      <main className={`min-h-screen bg-white dark:bg-black transition-opacity duration-300 ${
        loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Updated Hero Section */}
        <section className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
          <HeroPattern />
          
          <div className="absolute inset-0 flex flex-col">
            {/* Content Container */}
            <div className="flex-1 flex items-start px-6 pt-32 pb-40"> {/* Changed items-center to items-start and increased padding */}
              <div className="w-full max-w-xl mx-auto">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm mb-6">
                  <span className="flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-black dark:bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black dark:bg-white"></span>
                  </span>
                  <span className="text-sm text-black/90 dark:text-white/90">
                    Now accepting new providers
                  </span>
                </div>
                
                {/* Main Heading */}
                <h1 className="text-[32px] sm:text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white leading-tight">
                  Turn Your Skills into{' '}
                  <span className="text-black dark:text-white underline decoration-2 underline-offset-4">
                    Success
                  </span>
                </h1>
                
                {/* Description */}
                <p className="text-base sm:text-lg text-black/80 dark:text-white/80 leading-relaxed mb-6">
                  Join our growing network of professional service providers and connect with clients looking for your expertise.
                </p>
                
                {/* Buttons */}
                <div className="flex flex-col gap-3 mb-8"> {/* Reduced bottom margin */}
                  <Button
                    onClick={() => setShowForm(true)}
                    disabled={!applicationChecked || hasSubmitted}
                    className="w-full h-14 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {!applicationChecked ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                        <span>Checking status...</span>
                      </div>
                    ) : hasSubmitted ? (
                      'Application Pending'
                    ) : (
                      <>
                        <span>Apply Now</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-14 border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-medium rounded-lg transition-all flex items-center justify-center"
                    onClick={() => window.scrollTo({ top: document.getElementById('benefits')?.offsetTop, behavior: 'smooth' })}
                  >
                    Learn More
                  </Button>
                </div>

                {/* Stats Grid - fix spacing and layout */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-6 border-t border-black/10 dark:border-white/10">
                  <div className="flex flex-col">
                    <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                      500+
                    </div>
                    <div className="text-sm text-black/60 dark:text-white/60 mt-1">
                      Active Providers
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                      10K+
                    </div>
                    <div className="text-sm text-black/60 dark:text-white/60 mt-1">
                      Happy Customers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section - increase top spacing */}
        <section id="benefits" className="relative pt-24 pb-12 sm:py-16 md:py-24 bg-black dark:bg-white">
          <div className="container px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white dark:text-black">
                Why Choose Us?
              </h2>
              <p className="text-base text-white/60 dark:text-black/60">
                Join our platform and unlock a world of opportunities
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card 
                  key={index}
                  className="border border-white/10 dark:border-black/10 bg-black dark:bg-white"
                >
                  <div className="p-6 sm:p-8">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white dark:bg-black flex items-center justify-center mb-6">
                      <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-black dark:text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white dark:text-black">
                      {benefit.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/60 dark:text-black/60 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - make responsive */}
        <section className="relative py-12 sm:py-16 md:py-24 bg-white dark:bg-zinc-900">
          {/* Add decorative background pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-[0.07]" />
          </div>
          
          <div className="container relative px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
                How It Works
              </h2>
              <p className="text-base text-black/80 dark:text-white/80">
                Get started in just a few simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                {
                  number: '01',
                  title: 'Create Profile',
                  description: 'Fill out your professional details'
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
                <div key={index} className="relative group p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-bold text-black/10 dark:text-white/10 group-hover:text-black/20 dark:group-hover:text-white/20 transition-colors">
                      {item.number}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-black dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-black/70 dark:text-white/70">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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