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
          <h1 className="text-3xl font-bold">Search Statistics</h1>
          <p className="text-gray-500">View trending service requests from users</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {searchStats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white dark:bg-black p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold capitalize">{stat.term}</h3>
                    <span className="flex items-center gap-1 text-sm text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      {stat.frequency} searches
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Last searched by: {stat.userInfo.lastSearchedBy.email || 'Anonymous'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <div>First searched: {format(new Date(stat.firstSearched), "PPp")}</div>
                  <div>Last searched: {format(new Date(stat.lastSearched), "PPp")}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(stat.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {searchStats.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No search statistics found
            </p>
          )}
        </div>
      )}
    </div>
  );
} 