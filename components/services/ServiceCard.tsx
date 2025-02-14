"use client";
import React, { useState, useEffect } from "react";
import { Star, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { SimpleService } from "../../types/service";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
}

const ServiceCard = ({
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

  console.log("ServiceCard received imageUrl:", imageUrl);

  useEffect(() => {
    if (!user) return;

    const cartRef = doc(db, "carts", user.uid);
    const unsubscribe = onSnapshot(cartRef, (doc) => {
      try {
        if (doc.exists()) {
          const cartData = doc.data();
          if (cartData?.items && Array.isArray(cartData.items)) {
            const cartItem = cartData.items.find((item: any) => item.id === id);
            setQuantity(cartItem?.quantity || 0);
          } else {
            setQuantity(0);
          }
        } else {
          setQuantity(0);
        }
      } catch (error) {
        console.error("Error processing cart data:", error);
        setQuantity(0);
      }
    });

    return () => unsubscribe();
  }, [user, id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
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

      // Get the service document to get the image URL
      const serviceRef = doc(db, "services", id);
      const serviceDoc = await getDoc(serviceRef);
      const serviceData = serviceDoc.data();

      let updatedItems: CartItem[] = [];

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        if (cartData && Array.isArray(cartData.items)) {
          updatedItems = [...cartData.items];
        }
      }

      const existingItemIndex = updatedItems.findIndex(
        (item) => item.id === id
      );

      if (existingItemIndex !== -1) {
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        // Get the image URL from the service data
        const serviceImageUrl =
          serviceData?.images?.[0]?.url || "/placeholder-image.jpg";

        updatedItems.push({
          id,
          name: title,
          price,
          quantity: 1,
          imageUrl: serviceImageUrl, // Use the actual image URL from the service
          serviceProvider: providerName,
        });

        console.log("Adding item with image:", serviceImageUrl);
      }

      // Update cart
      await setDoc(
        cartRef,
        {
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

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
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
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
          const itemIndex = updatedItems.findIndex((item) => item.id === id);
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
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const handleQuantityChange = (e: React.MouseEvent, newQuantity: number) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up
    handleUpdateQuantity(newQuantity);
  };

  return (
    <div
      className={`bg-white dark:bg-black border border-gray-200 dark:border-white/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
        className || ""
      }`}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl || "/placeholder-image.jpg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow dark:bg-black">
        {/* Title and Description */}
        <div className="space-y-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-1">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {description}
          </p>
        </div>

        {/* Push buttons to bottom with auto-spacing */}
        <div className="mt-auto space-y-4">
          {/* Price and Rating */}
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary dark:text-primary/90">
              {formatPrice(price)}
            </span>
            <div className="flex items-center">
              {rating > 0 ? (
                <>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({totalRatings})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No reviews yet
                </span>
              )}
            </div>
          </div>

          {/* Modified Buttons section */}
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
};

export default ServiceCard;
