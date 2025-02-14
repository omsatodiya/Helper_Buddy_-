import React, { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/types/cart";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleQuantityChange = async (newQuantity: number) => {
    if (isUpdating || newQuantity < 1 || newQuantity > 99) return;
    setIsUpdating(true);

    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onRemove(item.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedPrice = item?.price ? item.price.toLocaleString("en-IN") : "0";

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg">
      {/* Image */}
      <div className="w-24 h-24 overflow-hidden rounded-md">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-black dark:text-white">
              {item.name}
            </h3>
            {item.serviceProvider && (
              <p className="text-sm text-gray-500 dark:text-white/70">
                Provider: {item.serviceProvider}
              </p>
            )}
          </div>
          <p className="font-semibold text-black dark:text-white">
            ₹{formattedPrice}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="mt-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 dark:border-white/10"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center dark:text-white">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 dark:border-white/10"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= 99}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
