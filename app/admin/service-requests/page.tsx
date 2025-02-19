"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2, ArrowLeft, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchStatistic {
  id: string;
  term: string;
  frequency: number;
  lastSearched: string;
  firstSearched: string;
  userInfo: {
    lastSearchedBy: {
      userId: string;
      email: string;
    };
  };
}

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [searchStats, setSearchStats] = useState<SearchStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSearchStats();
  }, []);

  const fetchSearchStats = async () => {
    try {
      const q = query(
        collection(db, "search-statistics"),
        orderBy("frequency", "desc")
      );
      const snapshot = await getDocs(q);
      const statsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SearchStatistic[];
      setSearchStats(statsData);
    } catch (error) {
      console.error("Error fetching search statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (statId: string) => {
    try {
      await deleteDoc(doc(db, "search-statistics", statId));
      toast({
        title: "Statistic Deleted",
        description: "Search statistic has been removed",
      });
      fetchSearchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete statistic",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin')}
          className="hover:bg-transparent p-0 h-auto"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Search Statistics</h1>
          <p className="text-sm sm:text-base text-gray-500">View trending service requests from users</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {searchStats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white dark:bg-black p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold capitalize">{stat.term}</h3>
                    <span className="flex items-center gap-1 text-sm text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      {stat.frequency} searches
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last searched by: {stat.userInfo.lastSearchedBy.email || 'Anonymous'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="whitespace-nowrap">
                      First searched: {format(new Date(stat.firstSearched), "PP p")}
                    </span>
                    <span className="whitespace-nowrap">
                      Last searched: {format(new Date(stat.lastSearched), "PP p")}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(stat.id)}
                  className="ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {searchStats.length === 0 && (
            <div className="text-center py-8 px-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No search statistics found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 