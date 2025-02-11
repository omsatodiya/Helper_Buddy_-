"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddServiceForm from "@/components/services/AddServiceForm";

export default function AddServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-black dark:bg-gray-900">
            Add New Service
          </h2>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <AddServiceForm
            isOpen={true}
            onClose={() => router.back()}
            onServiceAdded={() => {
              router.push("/admin");
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
