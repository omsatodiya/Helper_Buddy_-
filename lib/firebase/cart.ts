import { db } from "@/lib/firebase/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, deleteField } from "firebase/firestore";
import { CartItem } from "@/types/cart";

export const addToCart = async (userId: string, item: CartItem) => {
  try {
    const cartRef = doc(db, "carts", userId);
    const cartDoc = await getDoc(cartRef);
    
    if (!cartDoc.exists()) {
      // If cart doesn't exist, create a new one with the item as an array
      await setDoc(cartRef, {
        items: [{
          ...item,
          addedAt: new Date().toISOString()
        }],
        updatedAt: new Date().toISOString()
      });
    } else {
      // If cart exists, update it with the new item
      const cartData = cartDoc.data();
      const items = Array.isArray(cartData.items) ? cartData.items : [];
      
      // Check if item already exists
      const existingItemIndex = items.findIndex(
        (existingItem: CartItem) => existingItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        items[existingItemIndex].quantity += 1;
      } else {
        // Add new item to array
        items.push({
          ...item,
          addedAt: new Date().toISOString()
        });
      }

      await updateDoc(cartRef, {
        items: items,
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
    
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      return cartData.items || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting cart items:", error);
    return [];
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
      // Ensure items is an array
      const items = Array.isArray(cartData.items) ? cartData.items : [];
      
      const updatedItems = items.map((item: any) => {
        if (item.id === itemId) {
          // Preserve all existing item properties while updating quantity
          return {
            ...item,
            quantity: newQuantity
          };
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
      // Ensure items is an array
      const items = Array.isArray(cartData.items) ? cartData.items : [];
      
      const updatedItems = items.filter((item: any) => item.id !== itemId);

      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
}; 