import { getFirestore, doc, getDoc, updateDoc, increment, collection, query, where, getDocs, arrayUnion } from "firebase/firestore";

interface ReferralRecord {
  referredEmail: string;
  referralDate: string;
}

interface UserData {
  referralHistory?: ReferralRecord[];
  referredEmails?: string[];
  timesBeenReferred?: number;
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
  const referrerData = referrerSnapshot.docs[0].data() as UserData;
  
  // Check if this email has been used before for referrals
  const referredEmails = referrerData.referredEmails || [];
  if (referredEmails.includes(newUserEmail)) {
    return false;
  }

  // Get the new user's data
  const newUserDoc = await getDoc(doc(db, 'users', newUserId));
  if (!newUserDoc.exists()) return false;

  const newUserData = newUserDoc.data() as UserData;
  const timesBeenReferred = newUserData.timesBeenReferred || 0;

  // Check if user has been referred less than 10 times
  if (timesBeenReferred >= 10) {
    return false;
  }

  // Get referral bonus amount from admin settings
  const settingsDoc = await getDoc(doc(db, 'admin_settings', 'referral'));
  const bonusAmount = settingsDoc.exists() ? settingsDoc.data().bonusAmount : 100;
  
  // Update referrer's tracking and add bonus coins
  await updateDoc(doc(db, 'users', referrerId), {
    coins: increment(bonusAmount),
    referredEmails: [...referredEmails, newUserEmail],
    referralHistory: arrayUnion({
      referredEmail: newUserEmail,
      referralDate: new Date().toISOString()
    })
  });
  
  // Update new user's referral count only
  await updateDoc(doc(db, 'users', newUserId), {
    timesBeenReferred: increment(1)
  });
  
  return true;
} 