import { getFirestore, doc, getDoc, updateDoc, increment, collection, query, where, getDocs, arrayUnion } from "firebase/firestore";

interface ReferralRecord {
  referredEmail: string;
  referralDate: string;
}

export function generateReferralCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function processReferral(referralCode: string, newUserId: string, newUserEmail: string): Promise<boolean> {
  if (!referralCode) return false;
  
  const db = getFirestore();
  
  // Find user with this referral code
  const usersRef = collection(db, 'users');
  const referrerSnapshot = await getDocs(query(usersRef, where('referralCode', '==', referralCode)));
  
  if (referrerSnapshot.empty) return false;
  
  const referrerId = referrerSnapshot.docs[0].id;
  const referrerData = referrerSnapshot.docs[0].data();
  
  // Check if this email has been used before for referrals
  const referredEmails = referrerData.referredEmails || [];
  if (referredEmails.includes(newUserEmail)) {
    return false;
  }
  
  // Update referrer's coins and add to their referral list
  await updateDoc(doc(db, 'users', referrerId), {
    coins: increment(100),
    referredEmails: [...referredEmails, newUserEmail],
    referralHistory: arrayUnion({
      referredEmail: newUserEmail,
      referralDate: new Date().toISOString()
    } as ReferralRecord)
  });
  
  // Update new user's coins
  await updateDoc(doc(db, 'users', newUserId), {
    coins: increment(100)
  });
  
  return true;
} 