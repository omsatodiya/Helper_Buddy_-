import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';

interface LockoutData {
  attempts: number;
  lastAttempt: Timestamp;
  lockedUntil: Timestamp | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 15 minutes in milliseconds

export async function checkAccountLockout(email: string): Promise<{ isLocked: boolean; remainingTime?: number }> {
  const db = getFirestore();
  const lockoutRef = doc(db, 'loginAttempts', email);
  const lockoutDoc = await getDoc(lockoutRef);

  if (!lockoutDoc.exists()) {
    return { isLocked: false };
  }

  const data = lockoutDoc.data() as LockoutData;
  const now = new Date();

  // If there's a lockout time and it hasn't expired
  if (data.lockedUntil && data.lockedUntil.toDate() > now) {
    const remainingTime = data.lockedUntil.toDate().getTime() - now.getTime();
    return { isLocked: true, remainingTime };
  }

  // If the lockout has expired, reset the attempts
  if (data.lockedUntil && data.lockedUntil.toDate() <= now) {
    await updateDoc(lockoutRef, {
      attempts: 0,
      lockedUntil: null
    });
    return { isLocked: false };
  }

  return { isLocked: false };
}

export async function recordLoginAttempt(email: string, success: boolean): Promise<{ isLocked: boolean; remainingTime?: number }> {
  const db = getFirestore();
  const lockoutRef = doc(db, 'loginAttempts', email);
  const lockoutDoc = await getDoc(lockoutRef);
  const now = new Date();

  if (!lockoutDoc.exists()) {
    if (success) {
      await setDoc(lockoutRef, {
        attempts: 0,
        lastAttempt: Timestamp.fromDate(now),
        lockedUntil: null
      });
      return { isLocked: false };
    } else {
      await setDoc(lockoutRef, {
        attempts: 1,
        lastAttempt: Timestamp.fromDate(now),
        lockedUntil: null
      });
      return { isLocked: false };
    }
  }

  const data = lockoutDoc.data() as LockoutData;

  // If successful login, reset attempts
  if (success) {
    await updateDoc(lockoutRef, {
      attempts: 0,
      lastAttempt: Timestamp.fromDate(now),
      lockedUntil: null
    });
    return { isLocked: false };
  }

  // Calculate new attempts
  const newAttempts = data.attempts + 1;

  // If max attempts reached, lock the account
  if (newAttempts >= MAX_ATTEMPTS) {
    const lockoutTime = new Date(now.getTime() + LOCKOUT_DURATION);
    await updateDoc(lockoutRef, {
      attempts: newAttempts,
      lastAttempt: Timestamp.fromDate(now),
      lockedUntil: Timestamp.fromDate(lockoutTime)
    });
    return { isLocked: true, remainingTime: LOCKOUT_DURATION };
  }

  // Update attempts
  await updateDoc(lockoutRef, {
    attempts: newAttempts,
    lastAttempt: Timestamp.fromDate(now)
  });

  return { isLocked: false };
}

export function formatLockoutTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
} 