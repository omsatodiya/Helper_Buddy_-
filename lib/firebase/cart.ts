import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, deleteField } from "firebase/firestore";
import { CartItem } from "@/types/cart";

export const addToCart = async (userId: string, item: CartItem) => {
  try {
    // Create a reference to the user's cart document
    const cartRef = doc(db, "carts", userId);
    
    // Get the current cart
    const cartDoc = await getDoc(cartRef);
    
    if (!cartDoc.exists()) {
      // If cart doesn't exist, create a new one with the item
      await setDoc(cartRef, {
        items: {
          [item.id]: {
            ...item,
            addedAt: new Date().toISOString()
          }
        },
        updatedAt: new Date().toISOString()
      });
    } else {
      // If cart exists, update it with the new item
      const cartData = cartDoc.data();
      const updatedItems = {
        ...cartData.items,
        [item.id]: {
          ...item,
          addedAt: new Date().toISOString()
        }
      };

      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartRef);

    if (!cartDoc.exists() || !cartDoc.data().items) {
      return [];
    }

    const cartData = cartDoc.data();
    // Convert the items object to an array
    return Object.entries(cartData.items).map(([id, item]) => ({
      id,
      ...(item as {
        name: string;
        price: number;
        quantity: number;
        imageUrl: string;
        serviceProvider?: string;
        addedAt: string;
      })
    }));
  } catch (error) {
    console.error("Error getting cart items:", error);
    throw error;
  }
};

export const updateCartItemQuantity = async (
  userId: string,
  itemId: string,
  newQuantity: number
): Promise<void> => {
  try {
    const cartRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const updatedItems = cartData.items.map((item: any) => {
        if (item.id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      await setDoc(
        cartRef,
        {
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
};

export const removeFromCart = async (
  userId: string,
  itemId: string
): Promise<void> => {
  try {
    const cartRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const { [itemId]: removedItem, ...remainingItems } = cartData.items;

      await updateDoc(cartRef, {
        items: remainingItems,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
}; 