import React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  serviceProvider?: string;
}

const QuantityButton = ({
  onClick,
  children,
  disabled,
}: {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-8 h-8 rounded-full flex items-center justify-center
      transition-all duration-200
      ${
        disabled
          ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          : "hover:bg-primary/10 active:scale-95 dark:hover:bg-white/10"
      }
    `}
  >
    {children}
  </button>
);

export default function FloatingCart() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    const cartRef = doc(db, "carts", user.uid);
    const unsubscribe = onSnapshot(cartRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user || isLoading) return;
    setIsLoading(true);

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        let updatedItems = [...(cartData.items || [])] as CartItem[];

        if (newQuantity <= 0) {
          updatedItems = updatedItems.filter((item) => item.id !== itemId);
        } else {
          const itemIndex = updatedItems.findIndex(
            (item) => item.id === itemId
          );
          if (itemIndex !== -1) {
            updatedItems[itemIndex] = {
              ...updatedItems[itemIndex],
              quantity: newQuantity,
            };
          }
        }

        await setDoc(cartRef, { items: updatedItems }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Mobile version
  const MobileCart = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-white/20 p-4 shadow-lg z-50 h-[75px] lg:hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex flex-col">
          <span className="text-sm text-black/70 dark:text-white/70">
            Total
          </span>
          <span className="text-lg font-bold text-black dark:text-white">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
        <Button
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-6"
          onClick={() => router.push("/cart")}
        >
          View Cart
        </Button>
      </div>
    </div>
  );

  // Desktop version
  const DesktopCart = () => (
    <div className="hidden lg:block w-[320px] h-[500px] right-4 bg-white dark:bg-black border border-gray-200 dark:border-white/20 rounded-md shadow-lg z-40">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
            <ShoppingCart className="w-5 h-5" />
            Cart Summary
          </h3>
          <span className="text-sm text-black/70 dark:text-white/70">
            {cartItems.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-2 border-b border-gray-300 dark:border-gray-700"
            >
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-black dark:text-white">
                  {item.name}
                </h4>
                <p className="text-sm text-black/70 dark:text-white/70">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <QuantityButton
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </QuantityButton>
                  <span className="text-sm text-black dark:text-white">
                    {item.quantity}
                  </span>
                  <QuantityButton
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= 99}
                  >
                    <Plus className="w-3 h-3" />
                  </QuantityButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-white/20 mt-auto">
          <div className="flex justify-between mb-4">
            <span className="font-medium text-black dark:text-white">
              Total:
            </span>
            <span className="font-bold text-black dark:text-white">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <Button
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            onClick={() => router.push("/cart")}
          >
            Go to Cart
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileCart />
      <DesktopCart />
    </>
  );
}
