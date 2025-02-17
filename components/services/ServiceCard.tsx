"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import { Star, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { SimpleService } from "../../types/service";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import Image from "next/image"; // Using Next.js Image for better performance

interface ServiceCardProps {
  id: string;
  title: string;
  price: number;
  rating?: number;
  totalRatings?: number;
  description: string;
  imageUrl?: string;
  providerName?: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onClick?: () => void;
  className?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  serviceProvider?: string;
  thresholdTime: string;
}

const ServiceCard = memo(
  ({
    id,
    title,
    price,
    rating = 0,
    totalRatings,
    description,
    imageUrl,
    providerName,
    onAddToCart,
    onBuyNow,
    onClick,
    className,
  }: ServiceCardProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [quantity, setQuantity] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [localRating, setLocalRating] = useState(rating);
    const [localTotalRatings, setLocalTotalRatings] = useState(totalRatings);
    const [serviceThresholdTime, setServiceThresholdTime] =
      useState<string>("120");

    console.log("ServiceCard received imageUrl:", imageUrl);

    useEffect(() => {
      if (!user) return;

      const cartRef = doc(db, "carts", user.uid);
      const unsubscribe = onSnapshot(
        cartRef,
        (doc) => {
          if (doc.exists()) {
            const cartData = doc.data();
            const items = Array.isArray(cartData?.items) ? cartData.items : [];
            const cartItem = items.find((item: CartItem) => item.id === id);
            setQuantity(cartItem?.quantity || 0);
          } else {
            setQuantity(0);
          }
        },
        (error) => {
          console.error("Error in cart snapshot:", error);
          setQuantity(0);
        }
      );

      return () => unsubscribe();
    }, [user, id]);

    // Calculate average rating
    const calculateAverageRating = (reviews: any[] = []) => {
      if (reviews.length === 0) return 0;
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      return Number((sum / reviews.length).toFixed(1));
    };

    // Listen for service updates
    useEffect(() => {
      const serviceRef = doc(db, "services", id);
      const unsubscribe = onSnapshot(serviceRef, (doc) => {
        if (doc.exists()) {
          const serviceData = doc.data();
          setServiceThresholdTime(serviceData.thresholdTime || "120");
          const reviews = serviceData.reviews || [];
          const avgRating = calculateAverageRating(reviews);
          setLocalRating(avgRating);
          setLocalTotalRatings(reviews.length);
        }
      });

      return () => unsubscribe();
    }, [id]);

    const handleAddToCart = useCallback(
      async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
          toast({
            title: "Please sign in",
            description: "You need to be signed in to add items to cart",
            variant: "destructive",
          });
          return;
        }

        setIsLoading(true);
        try {
          const cartRef = doc(db, "carts", user.uid);
          const cartDoc = await getDoc(cartRef);
          const serviceRef = doc(db, "services", id);
          const serviceDoc = await getDoc(serviceRef);
          const serviceData = serviceDoc.data();

          let currentItems: CartItem[] = [];

          if (cartDoc.exists()) {
            const cartData = cartDoc.data();
            currentItems = Array.isArray(cartData?.items) ? cartData.items : [];
          }

          const existingItemIndex = currentItems.findIndex(
            (item) => item.id === id
          );

          const safeImageUrl =
            serviceData?.images?.[0]?.url || "/placeholder-image.jpg";

          let updatedItems: CartItem[];
          if (existingItemIndex !== -1) {
            updatedItems = [...currentItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: (updatedItems[existingItemIndex].quantity || 0) + 1,
            };
          } else {
            const newItem: CartItem = {
              id: id,
              name: title,
              price: price || 0,
              quantity: 1,
              imageUrl: safeImageUrl,
              serviceProvider: providerName,
              thresholdTime: serviceThresholdTime,
            };
            updatedItems = [...currentItems, newItem];
          }

          const cartData = {
            items: updatedItems.map((item) => ({
              ...item,
              imageUrl: item.imageUrl || "/placeholder-image.jpg",
            })),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(cartRef, cartData, { merge: true });

          toast({
            title: "Added to cart",
            description: "Service has been added to your cart",
          });
        } catch (error) {
          console.error("Error adding to cart:", error);
          toast({
            title: "Error",
            description: "Failed to add service to cart",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      [user, id, title, price, providerName, toast, serviceThresholdTime]
    );

    const handleUpdateQuantity = useCallback(
      async (newQuantity: number) => {
        if (!user || newQuantity < 0) return;

        setIsLoading(true);
        try {
          const cartRef = doc(db, "carts", user.uid);
          const cartDoc = await getDoc(cartRef);

          if (cartDoc.exists()) {
            const cartData = cartDoc.data();
            let updatedItems = [...(cartData.items || [])];

            if (newQuantity === 0) {
              // Remove item
              updatedItems = updatedItems.filter((item) => item.id !== id);
            } else {
              // Update quantity
              const itemIndex = updatedItems.findIndex(
                (item) => item.id === id
              );
              if (itemIndex !== -1) {
                updatedItems[itemIndex] = {
                  ...updatedItems[itemIndex],
                  quantity: newQuantity,
                };
              }
            }

            // Update the entire cart document
            await setDoc(cartRef, { items: updatedItems }, { merge: true });

            if (newQuantity === 0) {
              toast({
                title: "Removed from cart",
                description: "Service has been removed from your cart",
              });
            }
          }
        } catch (error) {
          console.error("Error updating quantity:", error);
          toast({
            title: "Error",
            description: "Failed to update quantity",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      [user, id, toast]
    );

    const formatPrice = (price: number) => {
      return `₹${price.toLocaleString("en-IN")}`;
    };

    const handleQuantityChange = (e: React.MouseEvent, newQuantity: number) => {
      e.preventDefault();
      e.stopPropagation(); // Stop event from bubbling up
      handleUpdateQuantity(newQuantity);
    };

    // Update the rating display section
    const renderRating = () => (
      <div className="flex items-center">
        {localRating > 0 ? (
          <>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(localRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              {localRating.toFixed(1)} ({localTotalRatings})
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
            No reviews yet
          </span>
        )}
      </div>
    );

    return (
      <div
        className={`bg-white dark:bg-black border border-gray-200 dark:border-white/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 ${
          className || ""
        }`}
        onClick={onClick}
      >
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={imageUrl || "/placeholder-image.jpg"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
            loading="lazy"
          />
        </div>

        <div className="p-5 flex flex-col flex-grow dark:bg-black">
          <div className="space-y-2 mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-1">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {description}
            </p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary dark:text-primary/90">
                {formatPrice(price)}
              </span>
              {renderRating()}
            </div>

            <div className="flex flex-col gap-2">
              {quantity > 0 ? (
                <div className="flex items-center justify-center gap-3 border rounded-md p-2">
                  <button
                    onClick={(e) => handleQuantityChange(e, quantity - 1)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm">{quantity}</span>
                  <button
                    onClick={(e) => handleQuantityChange(e, quantity + 1)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart();
                    handleAddToCart(e);
                  }}
                  className="w-full"
                >
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ServiceCard.displayName = "ServiceCard";

export default ServiceCard;
