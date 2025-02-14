import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Star } from "lucide-react";

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    id: string;
    rating: number;
    comment: string;
  };
  onReviewEdited: (editedReview: { rating: number; comment: string }) => void;
}

const EditReviewModal = ({
  isOpen,
  onClose,
  review,
  onReviewEdited,
}: EditReviewModalProps) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReviewEdited({ rating, comment });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-black">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Edit Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Review
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full dark:bg-black dark:text-white dark:border-white/20"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="dark:border-white/20 dark:text-white"
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReviewModal;
