"use client";

import React, { memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface AdminServiceCardProps {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const AdminServiceCard = memo(
  ({
    id,
    title,
    price,
    description,
    imageUrl,
    onEdit,
    onDelete,
  }: AdminServiceCardProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    const handleDelete = async () => {
      try {
        // Delete the service from Firestore
        await deleteDoc(doc(db, "services", id));

        toast({
          title: "Service deleted",
          description: "The service has been successfully deleted",
        });

        // Call the onDelete callback to update the UI
        onDelete();
      } catch (error) {
        console.error("Error deleting service:", error);
        toast({
          title: "Error",
          description: "Failed to delete service",
          variant: "destructive",
        });
      }
    };

    const formatPrice = (price: number) => {
      return `₹${price.toLocaleString("en-IN")}`;
    };

    return (
      <>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={imageUrl || "/placeholder-image.jpg"}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={false}
              loading="lazy"
            />
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-1">
                  {title}
                </h3>
                <span className="text-xl font-bold text-primary dark:text-primary/90">
                  {formatPrice(price)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {description}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => router.push(`/services/edit/${id}`)}
                variant="outline"
                className="flex-1 border-black hover:border-black/70 hover:bg-gray-50 dark:border-white dark:hover:border-white/70 dark:hover:bg-gray-900"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="flex-1 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Service</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this service? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

AdminServiceCard.displayName = "AdminServiceCard";

export default AdminServiceCard;
