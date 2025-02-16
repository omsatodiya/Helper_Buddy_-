"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServiceRequest {
  id: string;
  serviceName: string;
  description: string;
  createdAt: string;
  source: string;
  userInfo: {
    userId: string;
    email: string;
  };
}

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "service-requests"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceRequest[];
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "service-requests", requestId));
      toast({
        title: "Request Deleted",
        description: "Service request has been removed",
      });
      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin')}
          className="hover:bg-transparent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Service Requests</h1>
          <p className="text-gray-500">View requested services from users</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.serviceName}</h3>
                  <p className="text-sm text-gray-500">{request.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    From: {request.userInfo.email || 'Anonymous'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {format(new Date(request.createdAt), "PPp")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(request.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No service requests found
            </p>
          )}
        </div>
      )}
    </div>
  );
} 