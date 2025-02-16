import { db } from "@/lib/firebase/firebase";
import { collection, doc, setDoc, getDoc, deleteDoc, getDocs } from "firebase/firestore";

interface Address {
  id: string;
  label: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

export const saveAddress = async (userId: string, address: Address) => {
  try {
    const addressRef = doc(db, `users/${userId}/addresses/${address.id}`);
    await setDoc(addressRef, address);
    return true;
  } catch (error) {
    console.error("Error saving address:", error);
    throw error;
  }
};

export const getAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const addressesRef = collection(db, `users/${userId}/addresses`);
    const snapshot = await getDocs(addressesRef);
    return snapshot.docs.map(doc => ({ ...doc.data() } as Address));
  } catch (error) {
    console.error("Error getting addresses:", error);
    throw error;
  }
};

export const deleteAddress = async (userId: string, addressId: string) => {
  try {
    const addressRef = doc(db, `users/${userId}/addresses/${addressId}`);
    await deleteDoc(addressRef);
    return true;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
}; 