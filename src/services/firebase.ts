import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../config/firebase';
import { Medicine, UserProfile } from '../types';

const MEDICINES_COLLECTION = 'medicines';
const USERS_COLLECTION = 'users';

const ensureFirebase = (): boolean => {
  return !!(isFirebaseConfigured() && db && auth?.currentUser);
};

export const saveMedicineToFirebase = async (medicine: Medicine): Promise<boolean> => {
  if (!ensureFirebase()) return false;

  const userId = auth?.currentUser?.uid;
  if (!userId) return false;

  await setDoc(doc(db!, MEDICINES_COLLECTION, medicine.id), { ...medicine, userId });
  return true;
};

export const getMedicinesFromFirebase = async (): Promise<Medicine[]> => {
  if (!ensureFirebase()) return [];

  const userId = auth?.currentUser?.uid;
  if (!userId) return [];

  const medicinesRef = collection(db!, MEDICINES_COLLECTION);
  const snapshot = await getDocs(query(medicinesRef, where('userId', '==', userId)));

  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data() as Medicine & { userId: string };
    delete (data as { userId?: string }).userId;
    return data;
  });
};

export const deleteMedicineFromFirebase = async (medicineId: string): Promise<boolean> => {
  if (!ensureFirebase()) return false;
  await deleteDoc(doc(db!, MEDICINES_COLLECTION, medicineId));
  return true;
};

export const syncMedicinesToFirebase = async (medicines: Medicine[]): Promise<boolean> => {
  if (!ensureFirebase()) return false;
  await Promise.all(medicines.map((medicine) => saveMedicineToFirebase(medicine)));
  return true;
};

export const saveUserProfileToFirebase = async (profile: UserProfile): Promise<boolean> => {
  if (!isFirebaseConfigured() || !db) return false;
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile, { merge: true });
  return true;
};

export const getUserProfileFromFirebase = async (uid: string): Promise<UserProfile | null> => {
  if (!isFirebaseConfigured() || !db) return null;
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
};
