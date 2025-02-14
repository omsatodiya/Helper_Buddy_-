"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { getFirestore, getDocs, collection, query, where, updateDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';
import { usePathname } from 'next/navigation';

// Initialize EmailJS with your public key
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);

interface ProviderApplication {
  userId: string;
  userName: string;
  email: string;
  photo: string;
  services: string[];
  servicePincodes: { pincode: string }[];
  applicationDate: string;
  status: string;
  cloudinaryData?: {
    public_id: string;
    secure_url: string;
  };
}

const ITEMS_PER_PAGE = 10;

// Add this helper function for Cloudinary upload
const uploadToCloudinary = async (imageUrl: string) => {
  try {
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', 'provider_photos'); // Make sure this preset exists in your Cloudinary settings
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return {
      public_id: data.public_id,
      secure_url: data.secure_url
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Add this helper function for Cloudinary deletion
const deleteFromCloudinary = async (publicId: string) => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default function ProviderApplicationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore();
        const applicationsRef = collection(db, 'provider-applications');
        const q = query(applicationsRef, where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        
        const apps: ProviderApplication[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({ ...doc.data(), userId: doc.id } as ProviderApplication);
        });
        
        // Upload images to Cloudinary for new applications
        const updatedApps = await Promise.all(
          apps.map(async (app) => {
            if (app.photo && !app.cloudinaryData) {
              try {
                const cloudinaryData = await uploadToCloudinary(app.photo);
                // Update application with Cloudinary data
                await updateDoc(doc(db, 'provider-applications', app.userId), {
                  cloudinaryData
                });
                return { ...app, cloudinaryData };
              } catch (error) {
                console.error('Error uploading image:', error);
                return app;
              }
            }
            return app;
          })
        );

        setApplications(updatedApps);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    // Add structured data for the page
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Provider Applications Management',
      description: 'Manage and review service provider applications',
      url: `https://dudhkela.com${pathname}`,
    };

    // Add structured data to the page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pathname]);

  const handleApplicationReview = async (
    applicationId: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      setIsLoading(true);
      const db = getFirestore();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to review applications",
          variant: "destructive",
        });
        return;
      }
      
      // Update application status
      await updateDoc(doc(db, 'provider-applications', applicationId), {
        status,
        reviewDate: new Date(),
        reviewedBy: currentUser.uid
      });

      // Update user document based on status
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', applicationId), {
          role: 'provider',
          providerSince: new Date(),
          applicationStatus: 'approved'
        });

        // Get the application data to send email
        const applicationDoc = await getDoc(doc(db, 'provider-applications', applicationId));
        const applicationData = applicationDoc.data();

        if (applicationData) {
          // Send approval email using EmailJS
          try {
            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
              process.env.NEXT_PUBLIC_EMAILJS_PROVIDER_APPROVAL_TEMPLATE_ID!,
              {
                to_email: applicationData.email,
                to_name: applicationData.userName,
                from_name: "Dudh-Kela Support",
                reply_to: "support@dudhkela.com",
                subject: "Welcome to Dudh-Kela as a Service Provider!",
                services: applicationData.services.join(', '),
                service_areas: applicationData.servicePincodes.map((p: { pincode: string }) => p.pincode).join(', '),
                application_date: new Date(applicationData.applicationDate).toLocaleDateString(),
                approval_date: new Date().toLocaleDateString(),
              },
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
            );

            toast({
              title: "Email Sent",
              description: "Provider approval notification email sent successfully",
            });
          } catch (emailError) {
            console.error('Error sending approval email:', emailError);
            toast({
              title: "Email Error",
              description: "Failed to send approval notification email",
              variant: "destructive",
            });
          }
        }
      } else {
        // For rejected applications, immediately allow reapplication
        await updateDoc(doc(db, 'users', applicationId), {
          applicationStatus: 'rejected',
          canReapply: true,
          rejectionDate: new Date()
        });

        // Delete the application document to allow for reapplication
        await deleteDoc(doc(db, 'provider-applications', applicationId));
      }

      toast({
        title: `Application ${status}`,
        description: `Successfully ${status} the provider application.`,
      });

      // Refresh applications list
      const db2 = getFirestore();
      const applicationsRef = collection(db2, 'provider-applications');
      const q = query(applicationsRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      
      const apps: ProviderApplication[] = [];
      querySnapshot.forEach((doc) => {
        apps.push({ ...doc.data(), userId: doc.id } as ProviderApplication);
      });
      
      setApplications(apps);
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} the application`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPaginatedData = (data: ProviderApplication[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const paginatedApplications = getPaginatedData(applications, currentPage);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black dark:text-white">
          Provider Applications
        </h2>
        <Badge variant="outline" className="px-3 py-1">
          {applications.length} Pending
        </Badge>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
        {applications.length > 0 ? (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {paginatedApplications.map((application) => (
              <div key={application.userId} className="p-4 bg-white dark:bg-black hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start gap-4">
                  {/* Provider Image */}
                  {application.cloudinaryData?.secure_url ? (
                    <img 
                      src={application.cloudinaryData.secure_url}
                      alt={application.userName}
                      className="w-16 h-16 rounded-full object-cover border border-black/10 dark:border-white/10"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.classList.add('initial-avatar');
                        e.currentTarget.insertAdjacentHTML(
                          'beforeend',
                          `<div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
                            ${getInitials(application.userName)}
                          </div>`
                        );
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
                      {getInitials(application.userName)}
                    </div>
                  )}
                  
                  {/* Provider Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-black dark:text-white truncate">
                          {application.userName}
                        </h3>
                        <p className="text-sm text-black/60 dark:text-white/60">
                          {application.email}
                        </p>
                      </div>
                      <Badge>
                        {application.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-black/40 dark:text-white/40">Services:</span>{' '}
                        <span className="text-black/80 dark:text-white/80">{application.services.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-black/40 dark:text-white/40">Areas:</span>{' '}
                        <span className="text-black/80 dark:text-white/80">
                          {application.servicePincodes.map((p) => p.pincode).join(', ')}
                        </span>
                      </div>
                    </div>

                    {application.status === 'pending' && (
                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplicationReview(application.userId, 'approved')}
                          className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplicationReview(application.userId, 'rejected')}
                          className="border-black/20 hover:border-black hover:bg-black hover:text-white dark:border-white/20 dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-black/40 dark:text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-1">
              No Pending Applications
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60">
              There are currently no provider applications to review
            </p>
          </div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(applications.length / ITEMS_PER_PAGE))}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 