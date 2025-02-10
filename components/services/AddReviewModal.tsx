import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Star, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  increment,
  getDoc,
} from "firebase/firestore";
import { ServiceReview } from "@/types/service";
import { format } from "date-fns";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onReviewAdded: (review: ServiceReview) => void;
}

const AddReviewModal = ({
  isOpen,
  onClose,
  serviceId,
  onReviewAdded,
}: AddReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const review: ServiceReview = {
        id: Date.now().toString(),
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment,
        userName: "Anonymous", // Replace with actual user name
        userEmail: "anonymous@example.com", // Replace with actual user email
        date: new Date().toISOString(),
        helpful: 0,
      };

      // Update Firestore
      const serviceRef = doc(db, "services", serviceId);
      const serviceDoc = await getDoc(serviceRef);
      const currentTotalReviews = serviceDoc.data()?.totalReviews || 0;

      await updateDoc(serviceRef, {
        reviews: arrayUnion(review),
        totalReviews: increment(1),
        rating: increment(rating / (currentTotalReviews + 1)),
      });

      // Notify parent components
      onReviewAdded(review);
      onClose();
      setComment("");
      setRating(0);
    } catch (error) {
      toast({
        title: "Error adding review",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            Write a Review
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-center mb-2">
              How would you rate this service?
            </label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`w-10 h-10 cursor-pointer transition-all duration-200 hover:scale-110 ${
                    value <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                  onClick={() => setRating(value)}
                />
              ))}
            </div>
            <p className="text-sm text-center text-muted-foreground mt-2">
              {rating === 0
                ? "Select a rating"
                : rating === 5
                ? "Excellent!"
                : rating === 4
                ? "Very Good!"
                : rating === 3
                ? "Good"
                : rating === 2
                ? "Fair"
                : "Poor"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Share your experience
            </label>
            <Textarea
              placeholder="Tell us what you liked or didn't like..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              className="resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-24"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-24">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewModal;
