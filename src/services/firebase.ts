import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../config/firebase';
import { Medicine } from '../types';

const MEDICINES_COLLECTION = 'medicines';

// Helper to check if Firebase is available
const ensureFirebase = (): boolean => {
  if (!isFirebaseConfigured() || !db || !auth.currentUser) {
    return false;
  }
  return true;
};

export const saveMedicineToFirebase = async (medicine: Medicine): Promise<boolean> => {
  if (!ensureFirebase()) {
    return false;
  }

  const userId = auth.currentUser?.uid;
  if (!userId) return false;

  try {
    const medicineRef = doc(db!, MEDICINES_COLLECTION, medicine.id);
    await setDoc(medicineRef, {
      ...medicine,
      userId,
    });
    console.log('Medicine saved to Firebase:', medicine.id);
    return true;
  } catch (error) {
    console.error('Error saving medicine to Firebase:', error);
    throw error; // Let caller handle the error
  }
};

export const getMedicinesFromFirebase = async (): Promise<Medicine[]> => {
  if (!ensureFirebase()) {
    return [];
  }

  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  try {
    const medicinesRef = collection(db!, MEDICINES_COLLECTION);
    const q = query(medicinesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const medicines: Medicine[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Medicine & { userId: string };
      delete (data as { userId?: string }).userId;
      medicines.push(data);
    });

    console.log('Medicines fetched from Firebase:', medicines.length);
    return medicines;
  } catch (error) {
    console.error('Error fetching medicines from Firebase:', error);
    throw error;
  }
};

export const deleteMedicineFromFirebase = async (medicineId: string): Promise<boolean> => {
  if (!ensureFirebase()) {
    return false;
  }

  try {
    const medicineRef = doc(db!, MEDICINES_COLLECTION, medicineId);
    await deleteDoc(medicineRef);
    console.log('Medicine deleted from Firebase:', medicineId);
    return true;
  } catch (error) {
    console.error('Error deleting medicine from Firebase:', error);
    throw error;
  }
};

export const syncMedicinesToFirebase = async (medicines: Medicine[]): Promise<boolean> => {
  if (!ensureFirebase()) {
    return false;
  }

  try {
    for (const medicine of medicines) {
      await saveMedicineToFirebase(medicine);
    }
    console.log('All medicines synced to Firebase');
    return true;
  } catch (error) {
    console.error('Error syncing medicines to Firebase:', error);
    throw error;
  }
};
